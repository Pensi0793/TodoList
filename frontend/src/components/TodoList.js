import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Form, Input, List, message, Progress, Modal, Checkbox } from 'antd';
import './TodoList.css';

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

  const handleToggleComplete = async (id, completed) => {
    try {
      const res = await axios.put(
        `${apiUrl}/api/todos/${id}`,
        { completed: !completed },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      setTodos(todos.map(todo => 
        todo._id === id ? res.data : todo
      ));
      message.success('Cập nhật trạng thái thành công!');
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      if (err.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn');
        setToken(null);
        localStorage.removeItem('token');
      } else {
        message.error('Không thể cập nhật trạng thái');
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
    <div className="todoist-container">
      <div className="todoist-header">
        <div className="header-left">
          <h1>Hôm nay</h1>
          <span className="todo-count">{todos.length} công việc</span>
        </div>
        <div className="header-right">
          <Button type="text" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
      </div>

      <div className="todoist-content">
        <div className="add-todo-section">
          <Form form={form} onFinish={handleAdd} className="add-todo-form">
            <Form.Item
              name="title"
              rules={[{ required: true, message: 'Vui lòng nhập công việc!' }]}
            >
              <Input 
                placeholder="Thêm công việc mới..." 
                className="todo-input"
                prefix={<span className="plus-icon">+</span>}
              />
            </Form.Item>
          </Form>
        </div>

        <div className="todos-list">
          <List
            loading={loading}
            dataSource={todos}
            renderItem={todo => (
              <List.Item className="todo-item">
                <div className="todo-content">
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo._id, todo.completed)}
                    className="todo-checkbox"
                  >
                    <span className={`todo-title ${todo.completed ? 'completed' : ''}`}>
                      {todo.title}
                    </span>
                  </Checkbox>
                </div>
                <div className="todo-actions">
                  <Button 
                    type="text" 
                    onClick={() => showEditModal(todo)}
                    className="edit-btn"
                  >
                    Sửa
                  </Button>
                  <Button 
                    type="text" 
                    danger 
                    onClick={() => handleDelete(todo._id)}
                    className="delete-btn"
                  >
                    Xóa
                  </Button>
                </div>
              </List.Item>
            )}
          />
        </div>

        <div className="progress-section">
          <Progress
            percent={calculateProgress()}
            status={calculateProgress() === 100 ? 'success' : 'active'}
            className="todo-progress"
            showInfo={false}
          />
          <span className="progress-text">
            {calculateProgress()}% hoàn thành
          </span>
        </div>
      </div>

      <Modal
        title="Sửa công việc"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="edit-modal"
      >
        <Form
          initialValues={{ title: editingTodo?.title }}
          onFinish={handleEdit}
        >
          <Form.Item
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập công việc!' }]}
          >
            <Input placeholder="Nhập công việc" className="edit-input" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="update-btn">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TodoList;
