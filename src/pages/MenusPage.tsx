import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import {
  Accordion,
  ActionIcon,
  Group,
  Button,
  Box,
  Text,
  AccordionControlProps,
  Menu,
  NavLink,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Badge,
  Center,
} from "@mantine/core";
import { IconDots, IconEdit, IconPlus, IconTrash } from "@tabler/icons";
import { IDish, IMenu } from "../types";
import { closeAllModals, openModal } from "@mantine/modals";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { axiosInstance } from "../axios";
import { useRecoilValue } from "recoil";
import { userAtom } from "../store";
import { Calendar } from "@mantine/dates";

interface AccordionLabelProps {
  title: string;
  description: string;
}

const AccordionLabel = ({ title, description }: AccordionLabelProps) => {
  return (
    <Group>
      <div>
        <Text>{title}</Text>
        <Text size="sm" color="dimmed" weight={400}>
          {description.slice(0, 100)}
          {description.length > 100 ? "..." : ""}
        </Text>
      </div>
    </Group>
  );
};

interface AddDishesProps {
  menu: IMenu;
}

const UpdateMenuModal = ({ menu }: AddDishesProps) => {
  const [dishes, setDishes] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDishes = async () => {
      const result = await axiosInstance.get("/api/Dishes", {
        headers: { authorization: `Bearer ${token}` },
      });
      setDishes(
        result.data.map((dish: IDish) => ({
          value: dish.id,
          label: dish.title,
        }))
      );
    };
    fetchDishes();
  }, []);

  const form = useForm({
    initialValues: {
      title: menu.title,
      description: menu.description,
      timeToService: menu.timeToService.toString(),
      dishIds: menu.dishes?.map((dish: IDish) => dish.id),
    },
  });

  const updateMenu = async () => {
    const result: AxiosResponse = await axiosInstance.put(
      `/api/Menu/${menu.id}`,
      {
        menu: {
          title: form.values.title,
          description: form.values.description,
          timeToService: +form.values.timeToService,
          dishes: [],
        },
        dishIds: form.values.dishIds,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (result.status === 200) {
      console.log(menu)
      showNotification({
        title: "??????????????",
        message: "???????? ??????????????????",
        color: "teal",
      });

      closeAllModals();
    } else {
      showNotification({
        title: "?????????????????? ????????????",
        message: "?????????????????? ?????????????????????? ????????????",
        color: "red",
      });
    }

  };

  const time = [
    {
      value: "0",
      label: "??????????????",
    },
    { value: "1", label: "????????" },
    { value: "2", label: "????????" },
  ];

  return (
    <form onSubmit={form.onSubmit(updateMenu)}>
      <TextInput
        label="????????????????"
        placeholder="????????????????"
        data-autofocus
        value={form.values.title}
        onChange={(event) =>
          form.setFieldValue("title", event.currentTarget.value)
        }
      />
      <Textarea
        label="????????????????"
        placeholder="????????????????"
        value={form.values.description}
        onChange={(event) =>
          form.setFieldValue("description", event.currentTarget.value)
        }
      />
      <Select
        label="?????????? ????????????"
        defaultValue="0"
        data={time}
        value={form.values.timeToService}
        onChange={(value: string) => form.setFieldValue("timeToService", value)}
      />
      <MultiSelect
        label="??????????"
        data={dishes}
        value={form.values.dishIds}
        defaultValue={menu.dishes.map((dish: IDish) => dish.id)}
        onChange={(values) => form.setFieldValue("dishIds", values)}
      />
      <Button
        type="submit"
        fullWidth
        // onClick={() => closeAllModals()}
        mt="md"
      >
        ??????????????????
      </Button>
    </form>
  );
};

const deleteMenu = async (menuId: string) => {
  const token = localStorage.getItem("token");
  const result: AxiosResponse = await axiosInstance.delete(
    `/api/Menu/${menuId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (result.status === 200) {
    //?????????????? ????????????????setDishes(dishes.filter((dish) => dish.id !== id));
    showNotification({
      title: "??????????????",
      message: "???????? ??????????????",
      color: "teal",
    });

    closeAllModals();
  } else {
    showNotification({
      title: "?????????????????? ????????????",
      message: "?????????????????? ?????????????????????? ????????????",
      color: "red",
    });
  }
};

interface CreateOrderModalProps {
  menu: IMenu;
}

const CreateOrderModal = ({ menu }: CreateOrderModalProps) => {
  const user: any = useRecoilValue(userAtom);
  const [kids, setKids] = useState([]);

  useEffect(() => {
    const fetchKids = async () => {
      const data = await axiosInstance.get(
        `/api/Account/GetTrustesSchoolKids?trusteeId=${user.id}`
      );

      setKids(data.data.data.filter((x: any) => x));
    };
    fetchKids();
  }, []);

  const form = useForm({
    initialValues: {
      dishes: [] as string[],
      studentId: "",
      dates: [] as Date[],
    },
  });

  const createOrder = async () => {
    const data = await axiosInstance.post("/api/Menu/CreateOrder", {
      menuId: menu.id,
      schoolKidId: form.values.studentId,
      dishIds: form.values.dishes,
      dates: form.values.dates.map((date) => new Date(date).getTime()),
    });
    if (data.status === 200) {
      showNotification({
        title: "??????????????",
        message: "?????????? ????????????",
        color: "teal",
      });

      closeAllModals();
    } else {
      showNotification({
        title: "?????????????????? ????????????",
        message: "?????????????????? ?????????????????????? ????????????",
        color: "red",
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(createOrder)}>
      <Select
        label="??????????????"
        value={form.values.studentId}
        onChange={(value: string) => form.setFieldValue("studentId", value)}
        data={kids.filter(x => x).map((kid: any) => ({ label: kid.name, value: kid.id }))}
      />
      <MultiSelect
        label="??????????"
        data={menu.dishes.map((dish: IDish) => ({
          label: dish.title,
          value: dish.id,
        }))}
        value={form.values.dishes}
        onChange={(values) => form.setFieldValue("dishes", values)}
      />
      <Center>
        <Calendar
          multiple
          value={form.values.dates}
          onChange={(e) => {
            console.log(e);
            form.setFieldValue("dates", e);
          }}
        />
      </Center>

      <Button
        type="submit"
        fullWidth
        // onClick={() => closeAllModals()}
        mt="md"
      >
        ??????????????
      </Button>
    </form>
  );
};

const AccordionControl = (props: AccordionControlProps & { menu: IMenu }) => {
  const user: any = useRecoilValue(userAtom);
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Accordion.Control {...props} />
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <ActionIcon size="lg">
            <IconDots size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          {(user.role === "admin" || user.role === "canteenEmployee") && (
            <>
              <Menu.Item
                onClick={() =>
                  openModal({
                    title: "???????????????????????????? ????????",
                    children: <UpdateMenuModal menu={props.menu} />,
                  })
                }
                icon={<IconEdit />}
              >
                ??????????????????????????
              </Menu.Item>
              <Menu.Item
                onClick={() => deleteMenu(props.menu.id)}
                color="red"
                icon={<IconTrash />}
              >
                ??????????????
              </Menu.Item>
            </>
          )}
          {user.role === "trustee" && (
            <Menu.Item
              onClick={() =>
                openModal({
                  title: "???????????????? ????????????",
                  children: <CreateOrderModal menu={props.menu} />,
                })
              }
              icon={<IconPlus />}
            >
              ?????????????? ??????????
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
};

export const MenusPage = () => {
  const [menus, setMenus] = useState<IMenu[]>([]);
  const [fetching, setFetching] = useState(true);
  const user: any = useRecoilValue(userAtom);
  const navigate = useNavigate();
  const token: string | null = localStorage.getItem("token");

  const handleDelMenu = (obj_now:any) => {
    setMenus(menus.filter((menu) => menu.id !== obj_now.id))
  };
  useEffect(() => {
    const fetchData = async () => {
      const result: AxiosResponse = await axiosInstance.get("api/Menu", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMenus([...result.data.data]); //???????????? ?????? ???????????? ???????????? ????????, ???? ??????????????????)
      setFetching(false);
    };
    fetchData();
  }, []);
  //console.log(menus)
  const items =
    menus &&
    menus.map((menu: IMenu) => (
      <Accordion.Item value={menu.id} key={menu.id}>
        <AccordionControl menu={menu}>
          <AccordionLabel {...menu} />
        </AccordionControl>

        <Accordion.Panel>
          <Box>
            {menu.dishes?.map((dish: IDish) => (
              <NavLink
                key={dish.id}
                label={
                  <Group position="apart">
                    {dish.title}
                    <Badge color="green" variant="light">
                      {dish.price}???
                    </Badge>
                  </Group>
                }
                onClick={() =>
                  (user.role === "admin" || user.role === "canteenEmployee") &&
                  navigate(`/dishes/${dish.id}`)
                }
              />
            ))}
          </Box>
        </Accordion.Panel>
      </Accordion.Item>
    ));

  const FormModal = () => {
    const form = useForm({
      initialValues: {
        title: "",
        description: "",
        timeToService: "0",
      },
    });

    const createMenu = async () => {
      const result: AxiosResponse = await axiosInstance.post(
        "/api/Menu",
        {
          title: form.values.title,
          description: form.values.description,
          timeToService: +form.values.timeToService,
        },
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (result.status === 200) {
        console.log(1)
        setMenus([...menus, result.data.data])
        showNotification({
          title: "??????????????",
          message: "???????? ??????????????",
          color: "teal",
        });

        closeAllModals();
      } else {
        showNotification({
          title: "?????????????????? ????????????",
          message: "?????????????????? ?????????????????????? ????????????",
          color: "red",
        });
      }
    };

    const time = [
      {
        value: "0",
        label: "??????????????",
      },
      { value: "1", label: "????????" },
      { value: "2", label: "????????" },
    ];

    return (
      <form onSubmit={form.onSubmit(createMenu)}>
        <TextInput
          label="????????????????"
          placeholder="????????????????"
          data-autofocus
          value={form.values.title}
          onChange={(event) =>
            form.setFieldValue("title", event.currentTarget.value)
          }
        />
        <Textarea
          label="????????????????"
          placeholder="????????????????"
          value={form.values.description}
          onChange={(event) =>
            form.setFieldValue("description", event.currentTarget.value)
          }
        />
        <Select
          label="?????????? ????????????"
          defaultValue="0"
          data={time}
          value={form.values.timeToService}
          onChange={(value: string) =>
            form.setFieldValue("timeToService", value)
          }
        />
        <Button
          type="submit"
          fullWidth
          // onClick={() => closeAllModals()}
          mt="md"
        >
          ??????????????????
        </Button>
      </form>
    );
  };

  return (
    <>
      {(user.role === "admin" || user.role === "canteenEmployee") && (
        <Button
          my={10}
          onClick={() => {
            openModal({
              title: "???????????????? ????????",
              children: <FormModal />,
            });
          }}
        >
          ??????????????
        </Button>
      )}
      <Accordion chevronPosition="left" sx={{ width: 800 }} variant="separated">
        {items && items}
      </Accordion>

      {/*<DataTable*/}
      {/*  withBorder*/}
      {/*  borderRadius="sm"*/}
      {/*  withColumnBorders*/}
      {/*  striped*/}
      {/*  highlightOnHover*/}
      {/*  fetching={fetching}*/}
      {/*  columns={[*/}
      {/*    { accessor: "title", title: "????????????????", width: 200 },*/}
      {/*    { accessor: "description", title: "????????????????", width: 300 },*/}
      {/*    {*/}
      {/*      accessor: "timeToService",*/}
      {/*      title: "?????????? ????????????",*/}
      {/*      width: 150,*/}
      {/*      render: (record: IMenu) =>*/}
      {/*        ["??????????????", "????????", "????????"][record.timeToService],*/}
      {/*    },*/}
      {/*    {*/}
      {/*      accessor: "totalPrice",*/}
      {/*      title: "?????????? ??????????",*/}
      {/*      render: (record: IMenu) =>*/}
      {/*        record.dishes.length > 0*/}
      {/*          ? record.dishes*/}
      {/*              .map((dish: IDish) => dish.price)*/}
      {/*              .reduce((a, b) => a + b) + "???"*/}
      {/*          : "0???",*/}
      {/*    },*/}
      {/*    {*/}
      {/*      accessor: "actions",*/}
      {/*      title: "????????????????",*/}
      {/*      render: (record) => (*/}
      {/*        <Group spacing={4} position="apart">*/}
      {/*          <ActionIcon*/}
      {/*            color="blue"*/}
      {/*            onClick={(e) => {*/}
      {/*              e.stopPropagation();*/}
      {/*              openModal({*/}
      {/*                title: "???????????????????????????? ????????",*/}
      {/*                children: <UpdateMenuModal menu={record} />,*/}
      {/*              });*/}
      {/*            }}*/}
      {/*          >*/}
      {/*            <IconEdit size={16} />*/}
      {/*          </ActionIcon>*/}

      {/*          <ActionIcon*/}
      {/*            color="red"*/}
      {/*            onClick={(e) => {*/}
      {/*              e.stopPropagation();*/}
      {/*              deleteMenu(record.id);*/}
      {/*            }}*/}
      {/*          >*/}
      {/*            <IconTrash size={16} />*/}
      {/*          </ActionIcon>*/}
      {/*        </Group>*/}
      {/*      ),*/}
      {/*    },*/}
      {/*  ]}*/}
      {/*  records={menus}*/}
      {/*  rowExpansion={{*/}
      {/*    content: ({ record }) => (*/}
      {/*      <>*/}
      {/*        <Box>*/}
      {/*          {record.dishes.map((dish: IDish, key: number) => (*/}
      {/*            <NavLink*/}
      {/*              key={dish.id}*/}
      {/*              label={*/}
      {/*                <Group position="apart">*/}
      {/*                  {key + 1}. {dish.title}*/}
      {/*                  <Badge color="green" variant="light">*/}
      {/*                    {dish.price}???*/}
      {/*                  </Badge>*/}
      {/*                </Group>*/}
      {/*              }*/}
      {/*              onClick={() =>*/}
      {/*                user.role === "admin" && navigate(`/dishes/${dish.id}`)*/}
      {/*              }*/}
      {/*            />*/}
      {/*          ))}*/}
      {/*        </Box>*/}
      {/*      </>*/}
      {/*    ),*/}
      {/*  }}*/}
      {/*/>*/}
    </>
  );
};
