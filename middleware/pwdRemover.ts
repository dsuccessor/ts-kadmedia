interface Data {
    password: string;
    [key: string]: any;
  }
  
  const removePwd = async (data: Data): Promise<any> => {
    const { password, ...rest } = data;
    return { ...rest };
  }
  
  export { removePwd };
  