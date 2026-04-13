import { NextResponse } from 'next/server';

export type ApiErrorPayload = {
  code?: string;
  message: string;
};

export type ApiErrorResponse = {
  error: ApiErrorPayload;
};

export type ApiSuccessResponse<TData> = {
  data: TData;
};

export const apiError = (
  message: string,
  status: number,
  code?: string,
) =>
  NextResponse.json<ApiErrorResponse>(
    {
      error: {
        code,
        message,
      },
    },
    { status },
  );

export const apiOk = <TData>(data: TData, init?: ResponseInit) =>
  NextResponse.json<ApiSuccessResponse<TData>>({ data }, init);
