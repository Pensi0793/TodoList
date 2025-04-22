import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Input, message } from 'antd';

// Kiểm tra biến môi trường trước khi dùng
const apiUrl = process.env.VITE_API_URL || 'https://todolist-h26x.onrender.com';

const Login = ({ setToken }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

console.log('VITE_API_URL:', apiUrl);

if (!apiUrl) {
  console.error('❌ VITE_API_URL is undefined. Kiểm tra biến môi trường trên Vercel!');
}

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${apiUrl}/api/auth/login`,
        {
          username: values.username,
          password: values.password,
        },
        {
          withCredentials: true,
        }
      );
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      message.success('Đăng nhập thành công!');
      form.resetFields();
    } catch (err) {
      let errorMsg = 'Tài khoản hoặc mật khẩu không đúng';
      if (!err.response) {
        errorMsg = 'Lỗi kết nối mạng, vui lòng thử lại';
      } else if (err.response.status === 401) {
        errorMsg = 'Tài khoản hoặc mật khẩu không đúng';
      } else {
        errorMsg = err.response.data?.msg || 'Đã xảy ra lỗi khi đăng nhập';
      }
      message.error(errorMsg);
      console.error(err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Auth-container">
      <h2 className="Auth-title">Đăng nhập</h2>
      <Form
        form={form}
        name="login_form"
        className="Auth-form"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Tài khoản"
          name="username"
          rules={[
            { required: true, message: 'Vui lòng nhập tài khoản!' },
            { min: 3, message: 'Tài khoản phải có ít nhất 3 ký tự!' },
          ]}
        >
          <Input placeholder="Nhập tài khoản của bạn" disabled={isLoading} />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password placeholder="Nhập mật khẩu của bạn" disabled={isLoading} />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={isLoading} disabled={isLoading}>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
