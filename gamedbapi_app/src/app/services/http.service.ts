import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { APIResponse, Game } from '../models';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private games: Game[] = [];
  private gamesSubject$ = new BehaviorSubject(this.games);
  public games$ = this.gamesSubject$.asObservable();

  constructor(private readonly http: HttpClient) {}

  public getGameList(
    ordering: string,
    search?: string
  ): Observable<APIResponse<Game>> {
    let params = new HttpParams().set('ordering', ordering);
    if (search) {
      params = new HttpParams().set('ordering', ordering).set('search', search);
    }
    return this.http
      .get<APIResponse<Game>>(`${environment.BASE_URL}/games`, {
        params: params,
      })
      .pipe(
        tap<any>((data) => {
          this.games = [...data.results];
          this.gamesSubject$.next(this.games);
        })
      );
  }

  public getGameDetails(id: string): Observable<any> {
    const gameInfoRequest = this.http.get(
      `${environment.BASE_URL}/games/${id}`
    );

    const gameTrailerRequest = this.http.get(
      `${environment.BASE_URL}/games/${id}/movies`
    );

    const gameScreenshotsRequest = this.http.get(
      `${environment.BASE_URL}/games/${id}/screenshots`
    );

    // since there is multiple get request --> ForkJoin
    return forkJoin({
      gameInfoRequest,
      gameTrailerRequest,
      gameScreenshotsRequest,
    }).pipe(
      map((resp: any) => {
        return {
          ...resp['gameInfoRequest'],
          screenshots: resp['gameScreenshotsRequest'].results,
          trailers: resp['gameTrailerRequest'].results,
        };
      })
    );
  }
}
