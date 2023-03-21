import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { IDish } from "../types";
import { Badge, Button, Card, Container, Group, Text } from "@mantine/core";
import { DishComponent } from "../components";
import { axiosInstance } from "../axios";

export const DishPage = () => {
  const params = useParams();
  const token = localStorage.getItem("token");
  const [dish, setDish] = useState<IDish | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      const result: AxiosResponse = await axiosInstance.get(
        `/api/Dishes/${params.dishId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(result.data)
      setDish(result.data);
    };
    fetchData();
  }, []);

  return <DishComponent dish={dish} />;
};
