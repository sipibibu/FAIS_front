import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import {
  Anchor,
  Button,
  Group,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Text,
  Container,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { axiosInstance } from "../axios";
import { userAtom } from "../store";

export const LoginPage = () => {
  const [user, setUser] = useRecoilState<any>(userAtom);
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      login: "",
      password: "",
    },
  });

  const handleSubmit = async () => {
    try {
      console.log(form.values.login,form.values.password)
      const data = await axiosInstance.post(
        "/api/Account/Login",
        { login: form.values.login, password: form.values.password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("token", data.data.access_token);
      setUser((user: any) => jwtDecode(data.data.access_token));
      
      
      if ((jwtDecode(data.data.access_token) as any).role === "teacher") {
        navigate("/attendance", { replace: true });
        return;
      }

      if ((jwtDecode(data.data.access_token) as any).role === "trustee") {
        navigate("/account", { replace: true });
        return;
      }

      navigate("/menus", { replace: true });

      showNotification({
        title: "Вход выполнен",
        message: "Добро пожаловать!",
        color: "teal",
      });
    } catch (e) {
      showNotification({
        title: "Произошла ошибка",
        message: "Неверные данные для входа",
        color: "red",
      });
      return form.setErrors({
        login: "Неверные данные для входа",
        password: "Неверные данные для входа",
      });
    }
  };

  return (
    <Container size={500} my={40}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Text size="lg" weight={500}>
          Вход в систему
        </Text>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              required
              label="Логин"
              placeholder="Логин"
              value={form.values.login}
              onChange={(event) =>
                form.setFieldValue("login", event.currentTarget.value)
              }
              error={form.errors.login}
            />

            <PasswordInput
              required
              label="Пароль"
              placeholder="Пароль"
              value={form.values.password}
              onChange={(event) =>
                form.setFieldValue("password", event.currentTarget.value)
              }
              error={form.errors.password}
            />
          </Stack>

          <Group position="apart" mt="xl">
            <Anchor component="button" type="button" color="dimmed" size="xs">
              Забыли пароль?
            </Anchor>
            <Button type="submit">Войти</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};
