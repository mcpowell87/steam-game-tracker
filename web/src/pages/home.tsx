import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "@mui/material";
import { Stats } from "../types";
import { getStats } from "../api/steam-game-tracker";
import {
  GamesOwned,
  TotalCost,
  NumberPlayed,
  TotalPlaytime
} from '../components/stats'

type IParams = {
  steamId: string
};

const Home = () => {
  const [stats, setStats] = useState<Stats|undefined|null>();
  const [loading, setLoading] = useState(true);
  const { steamId } = useParams<IParams>();
  

  useEffect(() => {
    const fetchStats = async () => {
      if (!steamId) {
        setLoading(true);
        const s = await getStats("76561198065491686");
        setStats(s);
        setLoading(false);
        return;
      }
      setLoading(true);
      const s = await getStats(steamId);
      setStats(s);
      setLoading(false);
    }

    fetchStats().catch(error => {
      console.error(error);
    });
  }, [steamId]);

  return (
    <>
      <Grid container spacing={3}>
        <GamesOwned stats={stats} loading={loading} />
        <TotalCost stats={stats} loading={loading} />
        <NumberPlayed stats={stats} loading={loading} />
        <TotalPlaytime stats={stats} loading={loading} />
      </Grid>
    </>
  );
};

export default Home;