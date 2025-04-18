import React, { useState } from 'react';
import axios from 'axios';
import { Button, Checkbox, Form, Input, message } from 'antd';

const Auth = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true); // Chế độ Login hoặc Register
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const [form] = Form.useForm(); // Quản lý form với AntD

  // Hàm kiểm tra mật khẩu tùy chỉnh (chỉ áp dụng cho Register)
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

  const onFinish = async (values) => {
    setIsLoading(true); // Bật loading
    const url = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const { data } = await axios.post(`http://localhost:5000${url}`, {
        username: values.username,
        password: values.password,
      });
      setToken(data.token); // Cập nhật token qua prop
      localStorage.setItem('token', data.token); // Lưu token vào localStorage
      message.success(isLogin ? 'Đăng nhập thành công!' : 'Đăng ký thành công!');
      form.resetFields(); // Reset form sau khi thành công
    } catch (error) {
      // Xử lý thông báo lỗi
      let errorMsg;
      if (isLogin) {
        // Chỉ hiển thị lỗi này cho Login
        errorMsg = 'Tài khoản hoặc mật khẩu không đúng';
      } else {
        // Xử lý lỗi cho Register
        if (!error.response) {
          errorMsg = 'Lỗi kết nối mạng, vui lòng thử lại'; // Lỗi mạng
        } else if (error.response.data?.msg === 'Username already exists') {
          errorMsg = 'Tài khoản này đã tồn tại'; // Tài khoản đã tồn tại
        } else {
          errorMsg = error.response.data?.msg || 'Đã xảy ra lỗi khi đăng ký';
        }
      }
      message.error(errorMsg); // Hiển thị thông báo lỗi
    } finally {
      setIsLoading(false); // Tắt loading
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Validation Failed:', errorInfo);
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
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            // Áp dụng validatePassword chỉ khi ở chế độ Register
            !isLogin && { validator: validatePassword },
          ].filter(Boolean)} // Loại bỏ falsy values
        >
          <Input.Password placeholder="Nhập mật khẩu của bạn" disabled={isLoading} />
        </Form.Item>

        {isLogin && (
          <Form.Item
            name="remember"
            valuePropName="checked"
            wrapperCol={{ offset: 8, span: 16 }}
          >
            <Checkbox disabled={isLoading}>Ghi nhớ tôi</Checkbox>
          </Form.Item>
        )}

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={isLoading}
          >
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