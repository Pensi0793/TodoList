import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Input, message } from 'antd';

const Login = ({ setToken }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username: values.username,
        password: values.password,
      });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      message.success('Đăng nhập thành công!');
      form.resetFields();
    } catch (err) {
      message.error('Tài khoản hoặc mật khẩu không đúng');
      console.error(err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Validation Failed:', errorInfo);
  };

  return (
    <div className="Auth-container"> {/* Class để dùng App.css */}
      <h2 className="Auth-title">Đăng nhập</h2>
      <Form
        form={form}
        name="login_form"
        className="Auth-form"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
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
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;