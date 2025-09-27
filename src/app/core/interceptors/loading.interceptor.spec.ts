import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LoadingService } from '@core/services/loading.service';
import { loadingInterceptor } from './loading.interceptor';

class LoadingInterceptorTestBuilder {
  private loadingServiceSpy = jasmine.createSpyObj('LoadingService', [
    'show',
    'hide',
  ]);

  public withLoadingServiceSpy(spy: jasmine.SpyObj<LoadingService>): this {
    this.loadingServiceSpy = spy;
    return this;
  }

  public build(): {
    httpClient: HttpClient;
    httpTestingController: HttpTestingController;
    loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  } {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        { provide: LoadingService, useValue: this.loadingServiceSpy },
      ],
    });

    const httpClient = TestBed.inject(HttpClient);
    const httpTestingController = TestBed.inject(HttpTestingController);

    return {
      httpClient,
      httpTestingController,
      loadingServiceSpy: this.loadingServiceSpy,
    };
  }
}

describe('loadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;

  beforeEach(() => {
    // Arrange
    const builder = new LoadingInterceptorTestBuilder();
    const result = builder.build();
    httpClient = result.httpClient;
    httpTestingController = result.httpTestingController;
    loadingServiceSpy = result.loadingServiceSpy;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should call loadingService.show() before making the request', () => {
    // Arrange
    const testUrl = '/api/test';

    // Act
    httpClient.get(testUrl).subscribe();

    // Assert
    expect(loadingServiceSpy.show).toHaveBeenCalledTimes(1);

    const req = httpTestingController.expectOne(testUrl);
    req.flush({});
  });

  it('should call loadingService.hide() after the request completes successfully', () => {
    // Arrange
    const testUrl = '/api/test';
    const mockResponse = { data: 'test' };

    // Act
    httpClient.get(testUrl).subscribe();

    const req = httpTestingController.expectOne(testUrl);
    req.flush(mockResponse);

    // Assert
    expect(loadingServiceSpy.show).toHaveBeenCalledTimes(1);
    expect(loadingServiceSpy.hide).toHaveBeenCalledTimes(1);
  });

  it('should call loadingService.hide() after the request fails', () => {
    // Arrange
    const testUrl = '/api/test';
    const mockError = { status: 500, statusText: 'Server Error' };

    // Act
    httpClient.get(testUrl).subscribe({
      next: () => fail('Should have failed'),
      error: () => {},
    });

    const req = httpTestingController.expectOne(testUrl);
    req.flush(null, mockError);

    // Assert
    expect(loadingServiceSpy.show).toHaveBeenCalledTimes(1);
    expect(loadingServiceSpy.hide).toHaveBeenCalledTimes(1);
  });

  it('should call show once and hide once per request', () => {
    // Arrange
    const testUrl = '/api/test';

    // Act
    httpClient.get(testUrl).subscribe();

    const req = httpTestingController.expectOne(testUrl);
    req.flush({});

    // Assert
    expect(loadingServiceSpy.show).toHaveBeenCalledTimes(1);
    expect(loadingServiceSpy.hide).toHaveBeenCalledTimes(1);
  });
});
