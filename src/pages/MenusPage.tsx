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
  Title: string;
  Description: string;
}

const AccordionLabel = ({ Title, Description }: AccordionLabelProps) => {
  return (
    <Group>
      <div>
        <Text>{Title}</Text>
        <Text size="sm" color="dimmed" weight={400}>
          {Description.slice(0, 100)}
          {Description.length > 100 ? "..." : ""}
        </Text>
      </div>
    </Group>
  );
};



const UpdateMenuModal = ({ menus,menu,menus_copy }: any) => {
  const [Dishes, setDishes] = useState([]);
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchDishes = async () => {
      const result = await axiosInstance.get("/api/Dishes", {
        headers: { authorization: `Bearer ${token}` },
      });
      const parse_data = result.data.data.map((qwe: string)  => JSON.parse(qwe));
      setDishes(
        parse_data.map((dish: any) => ({
          value: dish.Id,
          label: dish.Title,
          price: dish.Price
        }))
      );

    };
    fetchDishes();
    
  }, []);
  
  const form = useForm({
    initialValues: {
      Title: menu.Title,
      Description: menu.Description,
      TimeToService: menu.TimeToService.toString(),
      DishesIds: menu.DishesIds,
    },
  });
  console.log(form.values)
  let data={
          Id: menu.Id,
          Title: form.values.Title,
          Description: form.values.Description,
          TimeToService: +form.values.TimeToService,
          DishesIds: form.values.DishesIds,
          $type:'Menu'
  }

  
  const updatedMenuArray = menus_copy.map((menuObject: { Id: any; }) => {
    if (menuObject.Id === data.Id) {
      return data;
    } else {
      return menuObject;
    }
  });
  menus[1](updatedMenuArray)//Прокинул прос от Menupage->AccordionControl->deleteMenu. Думаю кринж,но работает)
  
  const updateMenu = async () => {

    const result: AxiosResponse = await axiosInstance.put(
      `/api/Menu/?jsonObj=${JSON.stringify(data)}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (result.status === 200) {
      showNotification({
        title: "Успешно",
        message: "Меню обновлено",
        color: "teal",
      });

      closeAllModals();
    } else {
      showNotification({
        title: "Произошла ошибка",
        message: "Произошла неизвестная ошибка",
        color: "red",
      });
    }

  };
  
  const time = [
    {
      value: "0",
      label: "Завтрак",
    },
    { value: "1", label: "Обед" },
    { value: "2", label: "Ужин" },
  ];
  return (
    <form onSubmit={form.onSubmit(updateMenu)}>
      <TextInput
        label="Название"
        placeholder="Название"
        data-autofocus
        value={form.values.Title}
        onChange={(event) =>
          form.setFieldValue("Title", event.currentTarget.value)
        }
      />
      <Textarea
        label="Описание"
        placeholder="Описание"
        value={form.values.Description}
        onChange={(event) =>
          form.setFieldValue("Description", event.currentTarget.value)
        }
      />
      <Select
        label="Время подачи"
        defaultValue="0"
        data={time}
        value={form.values.TimeToService}
        onChange={(value: string) => form.setFieldValue("TimeToService", value)}
      />
      <MultiSelect
        label="Блюда"
        data={Dishes}
        value={form.values.DishesIds}
        
        onChange={(values) => {
          console.log(form.values.DishesIds)
          form.setFieldValue("DishesIds", values)}}
      />
      <Button
        type="submit"
        fullWidth
        // onClick={() => closeAllModals()}
        mt="md"
      >
        Сохранить
      </Button>
    </form>
  );
};

const deleteMenu = async (menuId: string,menus:any) => {
  menus[1]([...menus[0].filter((menu:any) => menu.Id !== menuId)])//Прокинул прос от Menupage->AccordionControl->deleteMenu. Думаю кринж,но работает)
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
    //Сделать удалениеsetDishes(Dishes.filter((dish) => dish.Id !== Id));
    showNotification({
      title: "Успешно",
      message: "Меню удалено",
      color: "teal",
    });

    closeAllModals();
  } else {
    showNotification({
      title: "Произошла ошибка",
      message: "Произошла неизвестная ошибка",
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
  const [Dishes, setDishes] = useState<any[]>([]);
  const token: string | null = localStorage.getItem("token");

  useEffect(() => {
    const fetchKids = async () => {
      const response = await axiosInstance.get(
        `/api/Account/GetPerson?personId=${user.personId}`
      );
        const response_parse=JSON.parse(response.data.data).SchoolKids
      setKids(response_parse.filter((x: any) => x));

      const result_d = await axiosInstance.get("/api/Dishes", {
        headers: { authorization: `Bearer ${token}` },
      });
      const parse_data = result_d.data.data.map((qwe: string)  => JSON.parse(qwe));
      setDishes(parse_data)

    };
    fetchKids();
  }, []);

  const form = useForm({
    initialValues: {
      DishesIds: [] as string[],
      studentId: "",
      dates: [] as Date[],
    },
  });

  let asd={
    MenuId: menu.Id,
    SchoolKidId: form.values.studentId,
    DishesIds: form.values.DishesIds,
    dates: form.values.dates.map((date) => new Date(date).getTime()),
    $type:"Order"
    }
  const createOrder = async () => {
    const data = await axiosInstance.post(`/Post?orderJson=${JSON.stringify(asd)}`, {},
    { headers: { authorization: `Bearer ${token}` } }
    );
    if (data.status === 200) {
      showNotification({
        title: "Успешно",
        message: "Заказ создан",
        color: "teal",
      });

      closeAllModals();
    } else {
      showNotification({
        title: "Произошла ошибка",
        message: "Произошла неизвестная ошибка",
        color: "red",
      });
    }
  };
  //?.map((dish: any) => (
   // Dishes.filter((dishes:any) => dishes.Id === dish)
   // .map((dishes:any) => ({label: dishes.Title, value: dishes.Id}))
   // ))
  return (
    <form onSubmit={form.onSubmit(createOrder)}>
      <Select
        label="Ребёнок"
        value={form.values.studentId}
        onChange={(value: string) => form.setFieldValue("studentId", value)}
        data={kids.filter(x => x).map((kid: any) => ({ label: kid.Name, value: kid.Id }))}
      />
      <MultiSelect
  label="Блюда"
  value={form.values.DishesIds}
  onChange={(value) => {form.setFieldValue("DishesIds", value)}}
  data={menu.DishesIds?.map((dish: any) => {
    const selectedDish = Dishes.find((dishes:any) => dishes.Id === dish);
    return selectedDish ? {label: selectedDish.Title, value: selectedDish.Id} : null;
  }).filter((dish: any) => dish !== null)}
/>
      <Center>
        <Calendar
          multiple
          value={form.values.dates}
          onChange={(e) => {
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
        Создать
      </Button>
    </form>
  );
};

const AccordionControl = (props: AccordionControlProps & { menu: any ,menus:any,menus_copy:any}) => {
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
                    title: "Редактирование меню",
                    children: <UpdateMenuModal menu={props.menu} menus={props.menus} menus_copy={props.menus_copy} />,
                  })
                }
                icon={<IconEdit />}
              >
                Редактировать
              </Menu.Item>
              <Menu.Item
                onClick={() => deleteMenu(props.menu.Id,props.menus)}
                color="red"
                icon={<IconTrash />}
              >
                Удалить
              </Menu.Item>
            </>
          )}
          {user.role === "parent" && (
            <Menu.Item
              onClick={() =>
                openModal({
                  title: "Создание заказа",
                  children: <CreateOrderModal menu={props.menu} />,
                })
              }
              icon={<IconPlus />}
            >
              Создать заказ
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
  const [Dishes, setDishes] = useState([]);
  const user: any = useRecoilValue(userAtom);
  const navigate = useNavigate();
  const token: string | null = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      const result: AxiosResponse = await axiosInstance.get("api/Menu", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result_d = await axiosInstance.get("/api/Dishes", {
        headers: { authorization: `Bearer ${token}` },
      });
      const parse_data = result_d.data.data.map((qwe: string)  => JSON.parse(qwe));
      setDishes(parse_data)
      let menu_parse = JSON.parse(result.data.data)
      .filter((item:any) => item.$type !== "BuffetMenu")//Пока оставляем вместо с остальными меню, но уберём в отдельную вкалдку.
       .map((qwe: string) => qwe);
      setMenus([...menu_parse]); //ошибка при пустом спимке меню, но работатет)
      setFetching(false);
    };
    fetchData();
  }, []);
  let menis_copy=menus
  const items =
    menus &&
    menus.map((menu: any) => (
      <Accordion.Item value={menu?.Id} key={menu?.Id}>
        <AccordionControl menu={menu} menus_copy={menis_copy} menus={[menus, setMenus]}>
          <AccordionLabel {...menu} />
        </AccordionControl>

        <Accordion.Panel>
          <Box>
            {menu.DishesIds?.map((dish: any) => (
              <NavLink
                key={dish?.Id}
                label={
                  <Group position="apart">
                    {
                    Dishes
                    .filter((dishes:any) => dishes.Id === dish)
                    .map((dishes:any) => dishes.Title)
                    }
                    <Badge color="green" variant="light">
                      {
                      Dishes
                      .filter((dishes:any) => dishes.Id === dish) 
                      .map((dishes:any) => dishes.Price)
                      }₽
                    </Badge>
                  </Group>
                }
                onClick={() =>
                  (user.role === "admin" || user.role === "canteenEmployee") &&
                  navigate(`/Dishes/${dish.Id}`)
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
        Title: "",
        Description: "",
        TimeToService: "0",
      },
    });

    let data={
         Title: form.values.Title,
         Description: form.values.Description,
         TimeToService: +form.values.TimeToService,
         $type:"Menu"
        }
    
    
    const createMenu = async () => {
      console.log(JSON.stringify(data))

      const result: AxiosResponse = await axiosInstance.post(
        `/api/Menu?jsonObj=${JSON.stringify(data)}`,
        {},
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (result.status === 200) {
        setMenus([...menus, JSON.parse(result.data.data)])
        showNotification({
          title: "Успешно",
          message: "Меню создано",
          color: "teal",
        });

        closeAllModals();
      } else {
        showNotification({
          title: "Произошла ошибка",
          message: "Произошла неизвестная ошибка",
          color: "red",
        });
      }
    };

    const time = [
      {
        value: "0",
        label: "Завтрак",
      },
      { value: "1", label: "Обед" },
      { value: "2", label: "Ужин" },
    ];

    return (
      <form onSubmit={form.onSubmit(createMenu)}>
        <TextInput
          label="Название"
          placeholder="Название"
          data-autofocus
          value={form.values.Title}
          onChange={(event) =>
            form.setFieldValue("Title", event.currentTarget.value)
          }
        />
        <Textarea
          label="Описание"
          placeholder="Описание"
          value={form.values.Description}
          onChange={(event) =>
            form.setFieldValue("Description", event.currentTarget.value)
          }
        />
        <Select
          label="Время подачи"
          defaultValue="0"
          data={time}
          value={form.values.TimeToService}
          onChange={(value: string) =>
            form.setFieldValue("TimeToService", value)
          }
        />
        <Button
          type="submit"
          fullWidth
          // onClick={() => closeAllModals()}
          mt="md"
        >
          Сохранить
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
              title: "Создание меню",
              children: <FormModal />,
            });
          }}
        >
          Создать
        </Button>
      )}
      <Accordion chevronPosition="left" sx={{ width: 800 }} variant="separated">
        {items && items}
      </Accordion>


    </>
  );
};
