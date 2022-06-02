export enum CrawlJob {
  CrawlSingleComic = 'CrawlSingleComicJob',
  CrawlSingleChapter = 'CrawlSingleChapter',
  CheckSingleChapter = 'CheckSingleChapter',
  NotifyNewChapter = 'NotifyNewChapter',
}

export enum CrawlQueue {
  CrawlSingleComic = 'CrawlSingleComicQueue',
  CrawlSingleChapter = 'CrawlSingleChapterQueue',
  NotificationQueue = 'NotificationQueue',
}

export const maxAttempt = 15;
