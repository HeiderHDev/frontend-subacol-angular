import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { HttpOptions } from '@core/interface/http-options';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';

/**
 * Servicio HTTP base para toda la aplicación
 * Responsabilidad: Centralizar configuración HTTP y manejo de requests\
 */
@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly http = inject(HttpClient);
  private readonly allowedHeaders = [
    'Authorization',
    'X-Requested-With',
    'Accept-Language',
  ];

  /**
   * Crea opciones por defecto para requests HTTP
   */
  public createDefaultOptions(): HttpOptions {
    return {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      retries: 2,
    };
  }

  /**
   * GET request genérico
   */
  public doGet<T>(url: string, opts?: HttpOptions): Observable<T> {
    const options = this.createOptions(opts);
    const httpOptions = { headers: options.headers, params: options.params };
    return this.http.get<T>(url, httpOptions).pipe(retry(options.retries || 0));
  }

  /**
   * GET con parámetros de query
   */
  public doGetWithParams<T>(
    url: string,
    params: HttpParams,
    opts?: HttpOptions
  ): Observable<T> {
    const options = this.createOptions(opts);
    const httpOptions = { headers: options.headers, params: params };
    return this.http.get<T>(url, httpOptions).pipe(retry(options.retries || 0));
  }

  /**
   * POST request genérico
   */
  public doPost<T, R>(url: string, body: T, opts?: HttpOptions): Observable<R> {
    const options = this.createOptions(opts);
    const httpOptions = { headers: options.headers };
    return this.http
      .post<R>(url, body, httpOptions)
      .pipe(retry(options.retries || 0));
  }

  /**
   * PUT request genérico
   */
  public doPut<T, R>(url: string, body: T, opts?: HttpOptions): Observable<R> {
    const options = this.createOptions(opts);
    const httpOptions = { headers: options.headers };
    return this.http
      .put<R>(url, body, httpOptions)
      .pipe(retry(options.retries || 0));
  }

  /**
   * PATCH request genérico
   */
  public doPatch<T, R>(
    url: string,
    body: T,
    opts?: HttpOptions
  ): Observable<R> {
    const options = this.createOptions(opts);
    const httpOptions = { headers: options.headers };
    return this.http
      .patch<R>(url, body, httpOptions)
      .pipe(retry(options.retries || 0));
  }

  /**
   * DELETE request genérico
   */
  public doDelete<R>(url: string, opts?: HttpOptions): Observable<R> {
    const options = this.createOptions(opts);
    const httpOptions = { headers: options.headers };
    return this.http
      .delete<R>(url, httpOptions)
      .pipe(retry(options.retries || 0));
  }

  /**
   * Crea headers específicos de forma segura
   */
  public createHeaderOptions(
    headerName: string,
    headerValue: string
  ): HttpOptions {
    if (!this.allowedHeaders.includes(headerName)) {
      throw new Error(`Header ${headerName} no está permitido`);
    }

    const options = this.createDefaultOptions();
    options.headers = options.headers?.set(headerName, headerValue);
    return options;
  }

  /**
   * Combina opciones con valores por defecto
   */
  private createOptions(opts?: HttpOptions): HttpOptions {
    const defaultOpts = this.createDefaultOptions();

    if (!opts) return defaultOpts;

    return {
      headers: opts.headers || defaultOpts.headers,
      params: opts.params || defaultOpts.params,
      retries: opts.retries ?? defaultOpts.retries,
    };
  }
}
