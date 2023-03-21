import { Container, createStyles, Navbar } from "@mantine/core";
import {
  IconFriends,
  IconListCheck,
  IconLogout,
  IconMenuOrder,
  IconMoodKid,
  IconSchool,
  IconSoup,
  IconToolsKitchen,
  IconToolsKitchen2,
  IconUser,
  IconUsers,
} from "@tabler/icons";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userAtom } from "../store";
import jwtDecode from "jwt-decode";

export const NavbarWrapper = () => {
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState<any>(userAtom);
  const location = useLocation();
  useEffect(() => {
    const token = localStorage.getItem("token")!;
    console.log(!token)
    if (!token) navigate("/login", { replace: true });
    setUser(jwtDecode(token));
  }, []);
  
  const useStyles = createStyles((theme, _params, getRef) => {
    const icon = getRef("icon");
    return {
      header: {
        paddingBottom: theme.spacing.md,
        marginBottom: theme.spacing.md * 1.5,
        borderBottom: `1px solid ${theme.colorScheme === "dark"
            ? theme.colors.dark[4]
            : theme.colors.gray[2]
          }`,
      },

      footer: {
        paddingTop: theme.spacing.md,
        marginTop: theme.spacing.md,
        borderTop: `1px solid ${theme.colorScheme === "dark"
            ? theme.colors.dark[4]
            : theme.colors.gray[2]
          }`,
      },

      link: {
        ...theme.fn.focusStyles(),
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        fontSize: theme.fontSizes.sm,
        color:
          theme.colorScheme === "dark"
            ? theme.colors.dark[1]
            : theme.colors.gray[7],
        padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
        borderRadius: theme.radius.sm,
        fontWeight: 500,

        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[0],
          color: theme.colorScheme === "dark" ? theme.white : theme.black,

          [`& .${icon}`]: {
            color: theme.colorScheme === "dark" ? theme.white : theme.black,
          },
        },
      },

      linkIcon: {
        ref: icon,
        color:
          theme.colorScheme === "dark"
            ? theme.colors.dark[2]
            : theme.colors.gray[6],
        marginRight: theme.spacing.sm,
      },

      linkActive: {
        "&, &:hover": {
          backgroundColor: theme.fn.variant({
            variant: "light",
            color: theme.primaryColor,
          }).background,
          color: theme.fn.variant({
            variant: "light",
            color: theme.primaryColor,
          }).color,
          [`& .${icon}`]: {
            color: theme.fn.variant({
              variant: "light",
              color: theme.primaryColor,
            }).color,
          },
        },
      },
    };
  });

  let data: any[] = [];
  
  if (user.role === "admin")

    data = [
      { link: "/menus", label: "Меню", icon: IconToolsKitchen },
      { link: "/menu_buffet", label: "Меню Буфета", icon: IconFriends },
      { link: "/dishes", label: "Блюда", icon: IconSoup },
      { link: "/employees", label: "Сотрудники", icon: IconToolsKitchen2 },
      { link: "/teachers", label: "Учителя", icon: IconSchool },
      { link: "/parents", label: "Родители", icon: IconUser },
      { link: "/students", label: "Ученики", icon: IconMoodKid }, 
      { link: "/classes", label: "Классы", icon: IconFriends },
    ];
  if (user.role === "trustee")
    data = [
      { link: "/account", label: "Аккаунт", icon: IconUser },
      { link: "/menus", label: "Меню", icon: IconToolsKitchen },
      { link: "/orders", label: "Заказы", icon: IconListCheck},
    ];
  if (user.role === "teacher")
    data = [{ link: "/attendance", label: "Посещаемость", icon: IconUsers }];
  if (user.role === "canteenEmployee")
    data = [
      { link: "/menus", label: "Меню", icon: IconToolsKitchen },
      { link: "/menu_buffet", label: "Меню Буфета", icon: IconFriends },
      { link: "/dishes", label: "Блюда", icon: IconSoup },
      { link: "/canteen", label: "Заказы столовой", icon: IconMenuOrder },
      { link: "/order_buffet", label: "Заказы Буфета", icon: IconListCheck},
    ];
  if (user.role === "schoolkid")
    data = [
      { link: "/menus", label: "Буфет", icon: IconToolsKitchen },
      { link: "/order", label: "Заказы", icon: IconMenuOrder },
    ];
 //if (user.role !== "schoolkid")
 //  data = [
 //    { link: "/menu_buffet", label: "Меню Буфета", icon: IconFriends },
 //    { link: "/schoolkidpage", label: "Буфет", icon: IconUsers },
 //  ]

  const { classes, cx } = useStyles();
  const [active, setActive] = useState("Меню");

  const links = data.map((item) => (
    <a
      className={cx(classes.link, {
        [classes.linkActive]: location.pathname.startsWith(item.link),
      })}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
        navigate(item.link);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));
  return (
    
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Navbar width={{ sm: 300 }} sx={{ position: "fixed", zIndex: 0 }} p="md">
        <Navbar.Section grow>{links}</Navbar.Section>

        <Navbar.Section className={classes.footer}>
          <a
            href=""
            className={classes.link}
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login", { replace: true });
            }}
          >
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>Выход из системы</span>
          </a>
        </Navbar.Section>
      </Navbar>
      <Container my={40} ml={300}>
        <Outlet />
      </Container>
    </div>
  );
};
