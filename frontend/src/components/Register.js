import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Input, message } from 'antd';

// Sử dụng URL của backend
const apiUrl = 'https://todolist-h26x.onrender.com';

const Register = ({ setToken }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const validatePassword = (_, value) => {
    if (!value) return Promise.reject(new Error('Vui lòng nhập mật khẩu!'));
    if (value.length < 6) return Promise.reject(new Error('Mật khẩu phải có ít nhất 6 ký tự!'));
    if (!/[A-Z]/.test(value)) return Promise.reject(new Error('Mật khẩu phải có ít nhất 1 chữ cái in hoa!'));
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return Promise.reject(new Error('Mật khẩu phải có ít nhất 1 ký tự đặc biệt!'));
    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      console.log('Đang gửi request đến:', `${apiUrl}/api/auth/register`);
      const res = await axios.post(
        `${apiUrl}/api/auth/register`,
        {
          username: values.username,
          password: values.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      console.log('Response:', res.data);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      message.success('Đăng ký thành công!');
      form.resetFields();
    } catch (err) {
      console.error('Lỗi khi đăng ký:', err);
      let errorMsg = 'Đã xảy ra lỗi khi đăng ký';
      
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
        
        if (err.response.data?.msg === 'Username already exists') {
          errorMsg = 'Tài khoản này đã tồn tại';
        } else {
          errorMsg = err.response.data?.msg || errorMsg;
        }
      } else if (err.request) {
        console.error('Request error:', err.request);
        errorMsg = 'Không thể kết nối đến server';
      } else {
        console.error('Error message:', err.message);
      }
      
      message.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Auth-container">
      <h2 className="Auth-title">Đăng ký</h2>
      <Form
        form={form}
        name="register_form"
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
          rules={[{ validator: validatePassword }]}
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
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
