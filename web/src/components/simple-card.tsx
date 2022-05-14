import React, { ReactNode } from 'react';
import { Typography, CircularProgress } from '@mui/material';
import Title from './title';

interface IProps {
    title: string;
    content?: ReactNode;
    secondary?: ReactNode;
    loading?: boolean;
};

const SimpleCard = ({title, content, secondary, loading}: IProps) => {
  if (loading) {
    return (
      <>
        <Title>{title}</Title>
        <Typography component="p" variant="h4" align="center">
          <CircularProgress />
        </Typography>
      </>
    )
  }

  return (
    <>
      <Title>{title}</Title>
      <Typography component="p" variant="h4">
        {content}
      </Typography>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        {secondary}
      </Typography>
    </>
  );
};

export default SimpleCard