import { useEffect, useState, useReducer } from "react";
import { axiosInstance } from "../axios";
import { ActionIcon, Box, Button, Group, NavLink, Table, TextInput } from "@mantine/core";
import { closeAllModals, openModal } from "@mantine/modals";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconEdit, IconTrash } from "@tabler/icons";
import { DataTable } from "mantine-datatable";

export const EmployeesPage = () => {
  const token: string | null = localStorage.getItem("token");
  const [employees, setEmployees] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true)
  const [userData, setUserData] = useState<any[]>([]);
  useEffect(() => {
    const fetchEmployees = async () => {
      const response = await axiosInstance.get(`/api/Account/GetPersons?role=canteenEmployee`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const parse_data = response.data.data.map((qwe: string)  => JSON.parse(qwe));
      setEmployees(parse_data);
      setFetching(false)
    };

    fetchEmployees();
  }, []);

  const handleButtonClick = async (record:any) => {
    console.log(record)
    record= record.UserId
    console.log(record)
    const result = await axiosInstance.get(
      `/api/Account/GetUser?userId=${record}`,
      { headers: { authorization: `Bearer ${token}` } }
    );
    setUserData((prevState: any) => ({
      ...prevState, [record]: JSON.parse(result.data.data),
    }));
  };
  const deleteEmployee = async (employeeId: string) => {
    const response = await axiosInstance.delete(`/api/Account/DeletePerson?personId=${employeeId}`, { headers: { authorization: `Bearer ${token}` } })

    if (response.data.statusCode === 200) {
      showNotification({
        title: "Успешно",
        message: `Сотрудник удален`,
        color: "teal",
      });

      setEmployees((old) => old.filter((s: any) => s.Id !== employeeId));

      closeAllModals();
    } else {
      showNotification({
        title: "Произошла ошибка",
        message: "Произошла неизвестная ошибка",
        color: "red",
      });
    }
  }

  const CreateEmployeeModal = () => {
    const form = useForm({
      initialValues: {
        Name: "",
      },
    });

    const createEmployee = async () => {
      const result = await axiosInstance.post(
        `/api/Account/Register`,
        {
          Name: form.values.Name,
          role: "canteenEmployee",  
        },
        { headers: { authorization: `Bearer ${token}` } }
      );


      
      let canteen_reg=JSON.parse(result.data.data) //Костыль из за одинаковоназванных переменных
      let canteen_data=JSON.parse(result.data.data).Person
      delete canteen_reg['Person'] 
      canteen_reg['UserId']=canteen_reg['Id']
      delete canteen_reg['Id']
      delete canteen_data['UserId']
      Object.assign(canteen_reg, canteen_data)
      if (result.data.statusCode === 200) {
        setEmployees([...employees,canteen_reg])
        
        showNotification({
          title: "Успешно",
          message: `Данные для входа: ${canteen_reg.Login}:${canteen_reg.Password} `,
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
      <form onSubmit={form.onSubmit(createEmployee)}>
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

  const UpdateEmployeeModal = (props: any) => {
    const form = useForm({
      initialValues: {
        Name: props.employee.Name,
        Login: userData[props.employee.Id]?.Login || '',
        Password: userData[props.employee.Id]?.Password || '',
      },
    });
    let data = {
      $type:"CanteenEmployee",
      Name: form.values.Name,
      role: 'canteenEmployee'
    }
    Object.assign(props.employee, data)
    console.log(props.employee)
    const updateEmployee = async () => {
      const result = await axiosInstance.put(
        `/api/Account/UpdatePerson?person=${JSON.stringify(props.employee)}`,
        { headers: { authorization: `Bearer ${token}` } }
      );

      let employee_data=JSON.parse(result.data.data)


      const result_log = await axiosInstance.put(
        `/api/Account/UpdateUserLogin?userId=${props.employee.UserId}&login=${form.values.Login}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      const result_pas = await axiosInstance.put(
       `/api/Account/UpdateUserPassword?userId=${props.employee.UserId}&password=${form.values.Password}`,
       { headers: { authorization: `Bearer ${token}` } }
     );
     setUserData([])

      if (result.data.statusCode === 200) {
        
        let index_element=employees.findIndex(dish=>dish.id ==employee_data.Id)
        employees[index_element]=employee_data
        setEmployees([...employees])
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
      <form onSubmit={form.onSubmit(updateEmployee)}>
        <TextInput
          label="Имя"
          placeholder="Имя"
          data-autofocus
          value={form.values.Name}
          onChange={(event) =>
            form.setFieldValue("Name", event.currentTarget.value)
          }
        />
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
            title: "Создание сотрудника",
            children: <CreateEmployeeModal />,
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
          { accessor: "login_pasword", width: 400, title: "login/pasword",render: (record)=>
          <>
           {userData[record?.UserId] ? (
             <div>Логин: {JSON.stringify(userData[record?.UserId].Login)} Пароль: {JSON.stringify(userData[record?.UserId].Password)} </div>
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
            width: 200,

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
                      title: "Редактирование сотрудника",
                      children: <UpdateEmployeeModal employee={record} />,
                    });
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>

                <ActionIcon
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEmployee(record.Id)
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        records={employees}
      />
    </>
  );
};
