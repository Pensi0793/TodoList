import React, { useState } from 'react';
import axios from 'axios';
import { Button, Checkbox, Form, Input, message } from 'antd';

// Kiểm tra biến môi trường
const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  console.error('❌ VITE_API_URL is undefined. Kiểm tra biến môi trường trên Vercel!');
}
console.log('VITE_API_URL:', apiUrl);

const Auth = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const validatePassword = (_, value) => {
    if (!value) return Promise.reject(new Error('Vui lòng nhập mật khẩu!'));
    if (value.length < 6) return Promise.reject(new Error('Mật khẩu phải có ít nhất 6 ký tự!'));
    if (!/[A-Z]/.test(value)) return Promise.reject(new Error('Mật khẩu phải có ít nhất 1 chữ cái in hoa!'));
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return Promise.reject(new Error('Mật khẩu phải có ít nhất 1 ký tự đặc biệt!'));
    return Promise.resolve();
  };

  const onFinish = async (values) => {
    setIsLoading(true);

    const url = isLogin
      ? `${apiUrl}/api/auth/login`
      : `${apiUrl}/api/auth/register`;

    try {
      const { data } = await axios.post(
        url,
        {
          username: values.username,
          password: values.password,
        },
        {
          withCredentials: true,
        }
      );

      setToken(data.token);
      localStorage.setItem('token', data.token);
      message.success(isLogin ? 'Đăng nhập thành công!' : 'Đăng ký thành công!');
      form.resetFields();
    } catch (error) {
      let errorMsg;
      if (isLogin) {
        errorMsg = 'Tài khoản hoặc mật khẩu không đúng';
      } else {
        if (!error.response) {
          errorMsg = 'Lỗi kết nối mạng, vui lòng thử lại';
        } else if (error.response.data?.msg === 'Username already exists') {
          errorMsg = 'Tài khoản này đã tồn tại';
        } else {
          errorMsg = error.response.data?.msg || 'Đã xảy ra lỗi khi đăng ký';
        }
      }
      message.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: '20px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        {isLogin ? 'Đăng nhập' : 'Đăng ký'}
      </h2>
      <Form
        form={form}
        name="auth_form"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
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
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            !isLogin && { validator: validatePassword },
          ].filter(Boolean)}
        >
          <Input.Password placeholder="Nhập mật khẩu của bạn" disabled={isLoading} />
        </Form.Item>

        {isLogin && (
          <Form.Item name="remember" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
            <Checkbox disabled={isLoading}>Ghi nhớ tôi</Checkbox>
          </Form.Item>
        )}

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={isLoading} disabled={isLoading}>
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </Button>
          <Button
            type="link"
            onClick={() => {
              setIsLogin(!isLogin);
              form.resetFields();
            }}
            style={{ marginLeft: 10 }}
            disabled={isLoading}
          >
            Chuyển sang {isLogin ? 'Đăng ký' : 'Đăng nhập'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Auth;
