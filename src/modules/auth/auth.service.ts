import {
  BadRequestException,
  HttpService,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as qs from 'qs';
import firebase from 'firebase';
import * as jsonWebToken from 'jsonwebtoken';
import * as BPromise from 'bluebird';
import { RegisterDto } from './register.dto';
import {
  FirebaseAuthenticationService,
  FirebaseMessagingService,
} from '@aginix/nestjs-firebase-admin';
import { UserRepository } from '../user/user.repository';
import { IUser } from '../user/user.interface';
import {
  AppleLoginDto,
  GoogleLoginDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RequestResetPassword,
  UpdateInfoDto,
} from './login.dto';
import { LoginResponse } from './auth.interface';
import { CONFIG } from '../config/config.provider';
import { IConfig } from 'config';
import { FirebaseClientToken } from '../firebaseClient/firebaseClient.provider';
import { FirebaseRefreshResponse } from '../../shared/constants';
import { RequestPlatformEnum, UserProvider } from '../user/user.constant';
import { PinoLogger } from 'nestjs-pino';
import { BookmarkRepository } from '../bookmark/bookmark.repository';
import { HistoryRepository } from '../history/history.repository';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import OAuthProvider = firebase.auth.OAuthProvider;

const jwt = BPromise.promisifyAll(jsonWebToken);

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly firebaseAuth: FirebaseAuthenticationService,
    private readonly firebaseMessagingService: FirebaseMessagingService,
    private readonly userRepository: UserRepository,
    @Inject(CONFIG) private readonly config: IConfig,
    @Inject(FirebaseClientToken) private readonly firebaseClientService,
    private readonly logger: PinoLogger,
    private readonly bookmarkRepository: BookmarkRepository,
    private readonly historyRepository: HistoryRepository,
  ) {}

  async register(registerDto: RegisterDto, platform: RequestPlatformEnum): Promise<IUser> {
    let { email } = registerDto;
    email = email.toLowerCase().trim();
    const user = await this.userRepository.findOne({ email });
    if (user?.provider === UserProvider.Email) {
      throw new UnprocessableEntityException(`${email} has been registered before`);
    }
    if ([UserProvider.Google, UserProvider.Apple].includes(user?.provider)) {
      throw new UnprocessableEntityException(
        `${email} has been logged in with ${user.provider}, please login with ${user.provider}`,
      );
    }
    try {
      const firebaseUser = await this.firebaseAuth.createUser(registerDto);
      return await this.userRepository.create({
        platform,
        email: registerDto.email,
        name: registerDto.name,
        userId: firebaseUser.uid,
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async refreshToken(refreshInput: RefreshTokenDto) {
    const firebaseClientCredential = this.config.get<string>('firebase.client');
    const apiKey = JSON.parse(firebaseClientCredential).apiKey;
    const firebaseRefreshUrl = this.config.get<string>('firebase.refreshTokenUrl');
    const url = `${firebaseRefreshUrl}?key=${apiKey}`;
    try {
      const refreshResponse = await this.httpService
        .post<FirebaseRefreshResponse>(
          url,
          qs.stringify({
            grant_type: 'refresh_token',
            refresh_token: refreshInput.refreshToken,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
        .toPromise();

      return {
        accessToken: refreshResponse.data.access_token,
        refreshToken: refreshResponse.data.refresh_token,
        expiresIn: refreshResponse.data.expires_in,
      };
    } catch (e) {
      throw new UnprocessableEntityException(e.message);
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.userRepository.findOne({ email: loginDto.email });
    if (!user || !user?.userId) {
      throw new BadRequestException(`${loginDto.email} not found`);
    }
    try {
      const loginRes = await this.firebaseClientService
        .auth()
        .signInWithEmailAndPassword(loginDto.email, loginDto.password);

      return {
        name: user.name,
        accessToken: loginRes?.user?.za,
        refreshToken: loginRes?.user?.refreshToken,
      };
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  async googleLogin(loginInput: GoogleLoginDto, platform: RequestPlatformEnum) {
    const { idToken } = loginInput;
    const decodedToken = jwt.decode(idToken);
    const email = decodedToken.email;
    const currentUser = await this.userRepository.findOne({
      email,
      provider: { $in: [UserProvider.Email, UserProvider.Apple] },
    });
    if (currentUser) {
      throw new BadRequestException(
        `Email ${email} is being used, please login with ${currentUser.provider} or reset your password.`,
      );
    }

    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const loginRes = await this.firebaseClientService.auth().signInWithCredential(credential);
      const isLoginBefore = await this.userRepository.exists({
        email,
        provider: UserProvider.Google,
      });
      if (!isLoginBefore) {
        await this.userRepository.create({
          email,
          platform,
          name: loginRes?.additionalUserInfo?.profile?.name,
          userId: loginRes.user.uid,
          provider: UserProvider.Google,
        });
      }

      return {
        accessToken: loginRes?.user?.za,
        refreshToken: loginRes?.user?.refreshToken,
      };
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  async appleLogin(loginInput: AppleLoginDto, platform: RequestPlatformEnum) {
    const { idToken } = loginInput;
    const decodedToken = jwt.decode(idToken);
    const email = decodedToken.email;
    const currentUser = await this.userRepository.findOne({
      email,
      provider: { $in: [UserProvider.Email, UserProvider.Google] },
    });
    if (currentUser) {
      throw new BadRequestException(
        `Email ${email} is being used, please login with ${currentUser.provider} or reset your password.`,
      );
    }

    try {
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken,
        rawNonce: loginInput.nonce,
      });
      const loginRes = await this.firebaseClientService.auth().signInWithCredential(credential);
      const isLoginBefore = await this.userRepository.exists({
        email,
        provider: UserProvider.Apple,
      });
      if (!isLoginBefore) {
        await this.userRepository.create({
          email,
          platform,
          name: loginRes?.additionalUserInfo?.profile?.name || email,
          userId: loginRes.user.uid,
          provider: UserProvider.Apple,
        });
      }

      return {
        accessToken: loginRes?.user?.za,
        refreshToken: loginRes?.user?.refreshToken,
      };
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  async me(userId: string, platform: RequestPlatformEnum) {
    const [bookmarkCount, historyCount, user] = await Promise.all([
      this.bookmarkRepository.count({ userId }),
      this.historyRepository.count({ userId }),
      this.userRepository.findOne({ userId }),
    ]);
    const name = user?.name || `${platform}-user: ${user?.id?.substr(user?.id?.length - 10)}`;

    return {
      ...user.toObject(),
      name,
      bookmarkCount,
      historyCount,
    };
  }

  async logout(userId: string, logoutDto: LogoutDto): Promise<any> {
    const user = await this.userRepository.findOne({ userId });
    if (!user || !user?.userId) {
      throw new BadRequestException(`${userId} not found`);
    }
    const { fcmToken } = logoutDto;
    try {
      const subscribedComics = await this.bookmarkRepository.find(
        { userId: user.userId },
        { projection: { comicId: 1 } },
      );
      await Promise.all(
        subscribedComics.map((bookmark) =>
          this.firebaseMessagingService.unsubscribeFromTopic(fcmToken, bookmark.comicId),
        ),
      );
    } catch (e) {
      this.logger.error(e.message);
    }

    return this.userRepository.updateOne({ userId }, { $pull: { fcmTokens: fcmToken } });
  }

  async updateInfo(userId: string, updateDto: UpdateInfoDto): Promise<IUser> {
    const user = await this.userRepository.findOne({ userId });
    if (!user || !user?.userId) {
      throw new BadRequestException(`${userId} not found`);
    }
    let updatePayload: Record<any, any> = {
      ...(updateDto.name && { name: updateDto.name }),
    };
    const { fcmToken } = updateDto;
    const isTokenExist = await this.userRepository.exists({ userId, fcmTokens: fcmToken });

    if (updateDto.fcmToken && !isTokenExist) {
      updatePayload = { ...updatePayload, $push: { fcmTokens: updateDto.fcmToken } };

      // Subscribe new FCM Token to exist comicIds
      const subscribedComics = await this.bookmarkRepository.find(
        { userId: user.userId },
        { projection: { comicId: 1 } },
      );
      subscribedComics.map((bookmark) =>
        this.firebaseMessagingService.subscribeToTopic(fcmToken, bookmark.comicId),
      );
    }
    await this.userRepository.updateOne({ userId }, updatePayload);
    return this.userRepository.findOne({ userId });
  }

  async sendPasswordResetEmail(resetInput: RequestResetPassword) {
    const user = await this.userRepository.findOne({
      email: resetInput.email,
      provider: UserProvider.Email,
    });
    if (!user || !user?.userId) {
      throw new BadRequestException(`${resetInput.email} not found`);
    }
    try {
      await this.firebaseClientService.auth().sendPasswordResetEmail(resetInput.email);
      return { sent: true };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
