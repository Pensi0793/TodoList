import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Input, message } from 'antd';

const Register = ({ setToken }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập mật khẩu!'));
    }
    if (value.length < 6) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 6 ký tự!'));
    }
    if (!/[A-Z]/.test(value)) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 1 chữ cái in hoa!'));
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 1 ký tự đặc biệt (ví dụ: !, @, #, $)'));
    }
    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        username: values.username,
        password: values.password,
      });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      message.success('Đăng ký thành công!');
      form.resetFields();
    } catch (err) {
      let errorMsg;
      if (!err.response) {
        errorMsg = 'Lỗi kết nối mạng, vui lòng thử lại';
      } else if (err.response.data?.msg === 'Username already exists') {
        errorMsg = 'Tài khoản này đã tồn tại';
      } else {
        errorMsg = err.response.data?.msg || 'Đã xảy ra lỗi khi đăng ký';
      }
      message.error(errorMsg);
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
      <h2 className="Auth-title">Đăng ký</h2>
      <Form
        form={form}
        name="register_form"
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