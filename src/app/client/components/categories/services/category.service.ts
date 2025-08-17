import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  filter,
  finalize,
  Observable,
  shareReplay,
  tap,
} from 'rxjs';
import {
  AnyCat,
  CategoryCard,
  CategorySummary,
} from '../types/categories.types';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private TTL_MS = 5 * 60 * 1000;
  private listCache = new Map<string, BehaviorSubject<AnyCat[] | null>>();
  private listInFlight = new Map<string, Observable<AnyCat[]>>();
  private listLastAt = new Map<string, number>();

  constructor(private http: HttpClient) {}

  list<T extends AnyCat>(opts: {
    fields: string;
    q?: string;
    page?: number;
    limit?: number;
    force?: boolean;
    sort?: string; //e.g. name
  }): Observable<T[]> {
    const {
      fields,
      q = '',
      page = 1,
      limit = 24,
      force = false,
      sort = 'name',
    } = opts;
    const key = JSON.stringify({ fields, q, page, limit, sort });
    let subject = this.listCache.get(key);
    if (!subject) {
      subject = new BehaviorSubject<AnyCat[] | null>(null);
      this.listCache.set(key, subject);
    }

    const last = this.listLastAt.get(key) ?? 0;
    const fresh = subject.value && Date.now() - last < this.TTL_MS;
    if (!force && fresh) return subject.pipe(filter((v): v is T[] => !!v));
    const inflight = this.listInFlight.get(key);
    if (inflight) return inflight as Observable<T[]>;
    let params = new HttpParams()
      .set('fields', fields)
      .set('limit', String(limit))
      .set('page', String(page))
      .set('sort', sort);
    if (q) params = params.set('q', q);

    const req$ = this.http.get<T[]>('/api/categories', { params }).pipe(
      tap((list) => {
        const sorted = [...list].sort((a: any, b: any) =>
          (a.name ?? '').localeCompare(b.name ?? '')
        );
        this.listLastAt.set(key, Date.now());
        subject.next(sorted);
      }),
      finalize(() => this.listInFlight.delete(key)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.listInFlight.set(key, req$ as unknown as Observable<AnyCat[]>);
    return req$;
  }

  /** Friendly helpers for common projections */
  listSummaries(force = false) {
    return this.list<CategorySummary>({
      fields: 'id,name',
      force,
      limit: 1000,
    });
  }
  listCards(
    opts: {
      page?: number;
      limit?: number;
      force?: boolean;
    } = {}
  ) {
    const { page = 1, limit = 24, force = false } = opts;
    return this.list<CategoryCard>({
      fields: 'id,name,image,path',
      page,
      limit,
      force,
    });
  }
    /** Bust caches after mutations */
  invalidateAll() {
    this.listLastAt.clear();
  }
}
