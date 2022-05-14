import React from 'react';
import { Grid, Paper } from '@mui/material';
import { Stats } from '../types';
import SimpleCard from '../components/simple-card';
import { jsx } from '@emotion/react';

interface IProps {
  stats: Stats | undefined | null,
  loading: boolean
};

export const GamesOwned = ({ stats, loading }: IProps): JSX.Element => {
  return (
    <Grid item xs={4} md={3} lg={2}>
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: 150,
        }}
      >
        <SimpleCard
          title="Games Owned"
          content={stats?.numberOwned.toString()}
          loading={loading}
        />
      </Paper>
    </Grid>
  );
};

export const TotalCost = ({ stats, loading }: IProps): JSX.Element => {
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  return (
    <Grid item xs={6} md={4} lg={3}>
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: 150,
        }}
      >
        <SimpleCard
          title="Total Cost"
          content={formatter.format(stats?.totalCost ?? 0)}
          loading={loading}
        />
      </Paper>
    </Grid>
  );
};

export const NumberPlayed = ({ stats, loading }: IProps): JSX.Element => {
  return (
    <Grid item xs={4} md={3} lg={2}>
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: 150,
        }}
      >
        <SimpleCard
          title="Number Played"
          content={stats?.numberPlayed ?? 0}
          secondary={`${stats?.percentagePlayed ?? 0}%`}
          loading={loading}
        />
      </Paper>
    </Grid>
  )
}

export const TotalPlaytime = ({ stats, loading }: IProps): JSX.Element => {
  return (
    <Grid item xs={6} md={4} lg={3}>
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: 150,
        }}
      >
        <SimpleCard
          title="Total Playtime"
          content={`${((stats?.totalPlaytimeMinutes ?? 0) / 60).toFixed(2)} hrs`}
          secondary={`${((stats?.totalPlaytimeMinutes ?? 0) / 60 / 24).toFixed(2)} days`}
          loading={loading}
        />
      </Paper>
    </Grid>
  )
}