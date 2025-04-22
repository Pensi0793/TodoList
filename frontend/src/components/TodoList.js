import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Form, Input, List, message, Progress, Modal } from 'antd';

const apiUrl = 'https://todolist-h26x.onrender.com';

const TodoList = ({ token, setToken }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/api/todos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      setTodos(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách todo:', err);
      if (err.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn');
        setToken(null);
        localStorage.removeItem('token');
      } else {
        message.error('Không thể lấy danh sách todo');
      }
    } finally {
      setLoading(false);
    }
  }, [token, setToken]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAdd = async (values) => {
    try {
      const res = await axios.post(
        `${apiUrl}/api/todos`,
        { title: values.title },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      setTodos([...todos, res.data]);
      form.resetFields();
      message.success('Thêm todo thành công!');
    } catch (err) {
      console.error('Lỗi khi thêm todo:', err);
      if (err.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn');
        setToken(null);
        localStorage.removeItem('token');
      } else {
        message.error('Không thể thêm todo');
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/todos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      setTodos(todos.filter(todo => todo._id !== id));
      message.success('Xóa todo thành công!');
    } catch (err) {
      console.error('Lỗi khi xóa todo:', err);
      if (err.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn');
        setToken(null);
        localStorage.removeItem('token');
      } else {
        message.error('Không thể xóa todo');
      }
    }
  };

  const handleEdit = async (values) => {
    try {
      const res = await axios.put(
        `${apiUrl}/api/todos/${editingTodo._id}`,
        { title: values.title },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      setTodos(todos.map(todo => 
        todo._id === editingTodo._id ? res.data : todo
      ));
      setIsModalVisible(false);
      message.success('Cập nhật todo thành công!');
    } catch (err) {
      console.error('Lỗi khi cập nhật todo:', err);
      if (err.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn');
        setToken(null);
        localStorage.removeItem('token');
      } else {
        message.error('Không thể cập nhật todo');
      }
    }
  };

  const showEditModal = (todo) => {
    setEditingTodo(todo);
    setIsModalVisible(true);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const calculateProgress = () => {
    if (todos.length === 0) return 0;
    const completedTodos = todos.filter((todo) => todo.completed).length;
    return Math.round((completedTodos / todos.length) * 100);
  };

  return (
    <div className="Todo-container">
      <div className="Todo-header">
        <h2>Danh sách công việc</h2>
        <Button type="primary" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </div>

      <Progress
        percent={calculateProgress()}
        status={calculateProgress() === 100 ? 'success' : 'active'}
        className="Todo-progress"
      />

      <Form form={form} onFinish={handleAdd}>
        <Form.Item
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập công việc!' }]}
        >
          <Input placeholder="Nhập công việc mới" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Thêm
          </Button>
        </Form.Item>
      </Form>

      <List
        loading={loading}
        dataSource={todos}
        renderItem={todo => (
          <List.Item
            actions={[
              <Button type="link" onClick={() => showEditModal(todo)}>
                Sửa
              </Button>,
              <Button type="link" danger onClick={() => handleDelete(todo._id)}>
                Xóa
              </Button>
            ]}
          >
            <List.Item.Meta title={todo.title} />
          </List.Item>
        )}
      />

      <Modal
        title="Sửa công việc"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          initialValues={{ title: editingTodo?.title }}
          onFinish={handleEdit}
        >
          <Form.Item
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập công việc!' }]}
          >
            <Input placeholder="Nhập công việc" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TodoList;
