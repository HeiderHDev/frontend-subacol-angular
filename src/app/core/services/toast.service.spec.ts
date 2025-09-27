import { TestBed } from '@angular/core/testing';
import { NgxToastService } from '@angular-magic/ngx-toast';

import { ToastService } from './toast.service';

class ToastServiceTestBuilder {
  private ngxToastServiceSpy = jasmine.createSpyObj('NgxToastService', [
    'success',
    'error',
    'warning',
    'info',
  ]);

  public withNgxToastServiceSpy(spy: jasmine.SpyObj<NgxToastService>): this {
    this.ngxToastServiceSpy = spy;
    return this;
  }

  public build(): {
    service: ToastService;
    ngxToastServiceSpy: jasmine.SpyObj<NgxToastService>;
  } {
    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: NgxToastService, useValue: this.ngxToastServiceSpy },
      ],
    });

    const service = TestBed.inject(ToastService);
    return { service, ngxToastServiceSpy: this.ngxToastServiceSpy };
  }
}

describe('ToastService', () => {
  let service: ToastService;
  let ngxToastServiceSpy: jasmine.SpyObj<NgxToastService>;
  let builder: ToastServiceTestBuilder;

  beforeEach(() => {
    builder = new ToastServiceTestBuilder();
    const result = builder.build();
    service = result.service;
    ngxToastServiceSpy = result.ngxToastServiceSpy;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('success', () => {
    it('should call ngxToastService.success with correct parameters', () => {
      // Arrange
      const title = 'Success Title';
      const message = 'Success Message';

      // Act
      service.success(title, message);

      // Assert
      expect(ngxToastServiceSpy.success).toHaveBeenCalledWith({
        title,
        messages: [message],
        delay: 8000,
      });
    });
  });

  describe('error', () => {
    it('should call ngxToastService.error with correct parameters', () => {
      // Arrange
      const title = 'Error Title';
      const message = 'Error Message';

      // Act
      service.error(title, message);

      // Assert
      expect(ngxToastServiceSpy.error).toHaveBeenCalledWith({
        title,
        messages: [message],
        delay: 8000,
      });
    });
  });

  describe('warning', () => {
    it('should call ngxToastService.warning with correct parameters', () => {
      // Arrange
      const title = 'Warning Title';
      const message = 'Warning Message';

      // Act
      service.warning(title, message);

      // Assert
      expect(ngxToastServiceSpy.warning).toHaveBeenCalledWith({
        title,
        messages: [message],
        delay: 8000,
      });
    });
  });

  describe('info', () => {
    it('should call ngxToastService.info with correct parameters', () => {
      // Arrange
      const title = 'Info Title';
      const message = 'Info Message';

      // Act
      service.info(title, message);

      // Assert
      expect(ngxToastServiceSpy.info).toHaveBeenCalledWith({
        title,
        messages: [message],
        delay: 8000,
      });
    });
  });
});
