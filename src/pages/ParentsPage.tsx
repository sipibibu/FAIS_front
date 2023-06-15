import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import { ActionIcon, Box, Button, Group, MultiSelect, TextInput } from "@mantine/core";
import { closeAllModals, openModal } from "@mantine/modals";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconEdit, IconTrash } from "@tabler/icons";
import { DataTable } from "mantine-datatable";

export const ParentsPage = () => {
  const token: string | null = localStorage.getItem("token");
  const [parents, setParents] = useState<any[]>([]);
  const [kids, setKids] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [userData, setUserData] = useState<any[]>([]);

  useEffect(() => {
    const fetchParents = async () => {

      const data = await axiosInstance.get(`/api/Account/GetPersons?Role=schoolKid`, {
        headers: { authorization: `Bearer ${token}`},
      });

      const parse_data_kid = data.data.data.map((qwe: string)  => JSON.parse(qwe));
      setKids(parse_data_kid);

      const response = await axiosInstance.get(`/api/Account/GetPersons?Role=parent`, {
        headers: { authorization: `Bearer ${token}` },
      });
                           
      const parse_data = response.data.data.map((qwe: string)  => JSON.parse(qwe));
      console.log(parse_data)   
      setParents(parse_data);
      setFetching(false)
    };
  

    fetchParents();
  }, []);
  const handleButtonClick = async (record: { UserId: any; }) => {
    const result = await axiosInstance.get(
      `/api/Account/GetUser?userId=${record.UserId}`,
      { headers: { authorization: `Bearer ${token}` } }
    );
    setUserData((prevState) => ({
      ...prevState,
      [record.UserId]: JSON.parse(result.data.data),
    }));
  };


  const deleteParent = async (parentId: string) => {
    
    const response = await axiosInstance.delete(`/api/Account/DeletePerson?personId=${parentId}`,
    { headers: { authorization: `Bearer ${token}` } })
    
   const response_parse=JSON.parse(response.data.data)
   
    if (response.data.statusCode === 200) {
      showNotification({
        title: "Успешно",
        message: `Родитель удален`,
        color: "teal",
      });

      setParents(parents.filter((s: any) => s.Id !== parentId));
      closeAllModals();
    } else {
      showNotification({
        title: "Произошла ошибка",
        message: "Произошла неизвестная ошибка",
        color: "red",
      });
    }
  }
  

  const CreateParentModal = () => {
    const form = useForm({
      initialValues: {
        Name: "",
      },
    });

    const createParent = async () => {
      const result = await axiosInstance.post(
        `/api/Account/Register`,
        {
          Name: form.values.Name,
          Role: "parent",
        },
        { headers: { authorization: `Bearer ${token}` } }
      );
      console.log((result.data.data))
      let parent_reg=JSON.parse(result.data.data)
      let parent_data=JSON.parse(result.data.data).Person

      delete parent_reg['Person'] 
      parent_reg['UserId']=parent_reg['Id']
      delete parent_reg['Id']
      delete parent_data['UserId']
      Object.assign(parent_reg, parent_data)

      if (result.status === 200) {
        setParents([...parents,parent_reg])
        
        showNotification({
          title: "Успешно",
          message: `Данные для входа: ${parent_reg.Login}:${parent_reg.Password} `,
          autoClose: false,
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
console.log(parents)
    return (
      <form onSubmit={form.onSubmit(createParent)}>
        <TextInput
          label="Имя"
          placeholder="Имя"
          data-autofocus
          value={form.values.Name}
          onChange={(event) =>
            form.setFieldValue("Name", event.currentTarget.value)
          }
        />
        <Button type="submit" fullWidth mt="md">
          Создать
        </Button>
      </form>
    );
  };

  const UpdateParentModal = (props: any) => {
    const [selected, setSelected] = useState(kids.filter((k: any) => props.parent.schoolKidIds?.includes(k.Id)).map((k: any) => k.Id))
    const form = useForm({
      initialValues: {
        Name: props.parent.Name,
        Login: userData[props.parent.UserId]?.Login || '',
        Password: userData[props.parent.UserId]?.Password || '',
      },
    });
    
      

    const updateParent = async () => {
      const result_kid = await axiosInstance.put(
        `/api/Account/PutSchoolKidsIntoParent?trusteeId=${props.parent.Id}`,
        selected,
        { headers: {
          'Content-Type': 'application/json',
          'accept': 'text/plain', 
          authorization: `Bearer ${token}` } 
        }
      );
      let data= {
          $type:"Parent",
          Name: form.values.Name,
          Role: "parent",
          SchoolKidIds: selected
        }


      Object.assign(props.parent, data)
        console.log(JSON.stringify(props.parent))
      const result = await axiosInstance.put(
        `/api/Account/UpdatePerson?person=${JSON.stringify(props.parent)}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      let parent_data=JSON.parse(result.data.data)
        console.log(result)
        console.log(JSON.stringify(props.parent))

      const result_log = await axiosInstance.put(
        `/api/Account/UpdateUserLogin?userId=${props.parent.UserId}&login=${form.values.Login}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      const result_pas = await axiosInstance.put(
       `/api/Account/UpdateUserPassword?userId=${props.parent.UserId}&password=${form.values.Password}`,
       { headers: { authorization: `Bearer ${token}` } }
     );
     setUserData([])
      if (result.data.statusCode === 200) {
        let index_element=parents.findIndex(parent=>parent.id ==parent_data.Id)
        parents[index_element]=parent_data
        setParents([...parents])

        showNotification({
          title: "Успешно",
          message: `Данные обновлены`,
          autoClose: false,
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

    return (
      <form onSubmit={form.onSubmit(updateParent)}>
        <TextInput
          label="Имя"
          placeholder="Имя"
          data-autofocus
          value={form.values.Name}
          onChange={(event) =>
            form.setFieldValue("Name", event.currentTarget.value)
          }
        />
        <MultiSelect label="Дети" value={selected} onChange={setSelected} data={kids.map((k: any) => ({ value: k.Id, label: k.Name }))} />
        <TextInput
          label="Логин"
          placeholder="Логин"
          data-autofocus
          value={form.values.Login}
          onChange={(event) =>
            form.setFieldValue("Login", event.currentTarget.value)
          }
        />
        <TextInput
          label="Пароль"
          placeholder="Пароль"
          data-autofocus
          value={form.values.Password}
          onChange={(event) =>
            form.setFieldValue("Password", event.currentTarget.value)
          }
        />
        <Button
          type="submit"
          fullWidth
          // onClick={() => updateParentKids(props.parent.id)}
          mt="md"
        >
          Сохранить
        </Button>
      </form>
    );
  };

  return (
    <>
      <Button
        onClick={() =>
          openModal({
            title: "Создание родителя",
            children: <CreateParentModal />,
          })
        }
        my={10}
      >
        Создать
      </Button>
      <DataTable
        withBorder
        borderRadius="sm"
        withColumnBorders
        minHeight={100}
        striped
        highlightOnHover
        fetching={fetching}
        columns={[
          // { accessor: "id", title: "ID" },
          { accessor: "login_pasword", width: 300, title: "login/pasword",render: (record)=>
          <>
           {userData[record?.UserId] ? (
             <div>Логин: {JSON.stringify(userData[record.UserId].Login)} Пароль: {JSON.stringify(userData[record.UserId].Password)} </div>
           ) : (
             <Button onClick={() => handleButtonClick(record)} my={1}>
               Посмотреть
             </Button>
           )}
         </>
        },
          {
            accessor: "Name",
            title: "Имя",
            width: 400,

          },
          {
            accessor: "Role",
            title: "Роль",
          },
          {
            accessor: "actions",
            title: "Действия",
            render: (record) => (
              <Group spacing={4} position="apart">
                <ActionIcon
                  color="blue"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal({
                      title: "Редактирование родителя",
                      children: <UpdateParentModal parent={record} />,
                    });
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>

                <ActionIcon
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteParent(record.Id)
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        records={parents}
      />
    </>
  );
};
