import React, { FC } from 'react' ;

export type Route = {
  key: string,
  title: string,
  path: string,
  enabled: boolean,
  component: FC<{}>
};