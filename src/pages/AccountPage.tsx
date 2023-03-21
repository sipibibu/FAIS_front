import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import jwtDecode from "jwt-decode";
import { createStyles, Avatar, Text, Group,Paper,Badge   } from '@mantine/core';
import { IconPhoneCall, IconAt } from '@tabler/icons-react';



const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5],
  },

  name: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },
}));


function MoneyAccount({ balance }: { balance: number }) {
  return (
    <Badge color="red" size="xl">
      <Text color="red">
        ₽{balance.toFixed(2)}
      </Text>
    </Badge>
  );
}

export function AccountPage({ avatar, name, title, phone, email }: any) {
  const { classes } = useStyles();
  const token = localStorage.getItem("token")!;
  const user: any = jwtDecode(token);
  const [user_info, setuser_info] = useState<any[]>([]);
  const [kids, setKids] = useState<any[]>([]);
  useEffect(() => {
        const Rofl = async () => {///GetTrustesSchoolKids
            const data = await axiosInstance.get("/api/Account/GetTrustees", {
                headers: { authorization: `Bearer ${token}` },
              });
            const result = await axiosInstance.get(
              `/api/Account/GetTrustesSchoolKids?trusteeId=${user.id}`
            );
        
            setKids(result.data.data.filter((x: any) => x));
            setuser_info(data.data.data);
          };
          Rofl();
      }, []);
      console.log(kids)
      console.log(user_info)
      
      return (
        <>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          
        <Group noWrap>
          <Avatar src={avatar} size={90} radius="md" />
          <div>
            <Text fz="xl" tt="uppercase" fw={700} color="dimmed">
              {title}
            </Text>
          
            <Text fz="xl" fw={500} className={classes.name}>
              {user_info[0]?.name} 
            </Text>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
              <MoneyAccount balance={213} />
            </div>
            
            <Group noWrap spacing={10} mt={3}>
              <IconAt stroke={1.5} size="1.5rem" className={classes.icon} />
              <Text fz="xl" c="dimmed">
                There will be a mail rofl.shock.2000@mail.ru
              </Text>
            </Group>
    
            <Group noWrap spacing={10} mt={5}>
              <IconPhoneCall stroke={1.5} size="1.5rem" className={classes.icon} />
              <Text fz="xl" c="dimmed">
                +7 222 333 11 44  
              </Text>
            </Group>
          </div>
        </Group>
    
        
      </div>
    
      <Paper mt={5} py={3} px={5}>
        <Text fz="xl" fw={700} mb={3}>
          Дети
        </Text>
    
        {kids.map((kid) => (
          <div key={kid.id}>
            <Text fz="lg" fw={500} className={classes.name}>
              {kid.name}
            </Text>
          </div>
        ))}
      </Paper>
      </>
      );
}
//export const AccountPage = () => {
//  const token = localStorage.getItem("token")!;
//  const user: any = jwtDecode(token);
//  const [user_info, setuser_info] = useState<any[]>([]);
//
//
//  useEffect(() => {
//    const Rofl = async () => {
//        const data = await axiosInstance.get("/api/Account/GetTrustees", {
//            headers: { authorization: `Bearer ${token}` },
//          });
//        setuser_info(data.data.data);
//      };
//      
//      Rofl();
//  }, []);
//    
//    console.log(user_info)
//    return (
//      <>
//        <div>{user_info[0]?.name}</div>
//        <div>{user_info[0]?.schoolKidIds}</div>
//      </>
//    );
//
//};
