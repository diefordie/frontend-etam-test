"use client";

import React, { useState, useEffect } from 'react';
import { Grid } from 'gridjs-react';

const GridWrapper = ({ data, columns, ...props }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <Grid data={data} columns={columns} {...props} />;
};

export default GridWrapper;