import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Form, Input, List, message, Progress, Modal, Checkbox, Select, DatePicker, Tag, Tooltip, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined, TagOutlined, ProjectOutlined, ExclamationCircleOutlined, MenuFoldOutlined, MenuUnfoldOutlined, CheckCircleOutlined, CalendarOutlined, InboxOutlined, BarsOutlined } from '@ant-design/icons';
import './TodoList.css';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const apiUrl = 'https://todolist-h26x.onrender.com';

const TodoList = ({ token, setToken }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [projects, setProjects] = useState(['Công việc', 'Cá nhân', 'Học tập']);
  const [tags, setTags] = useState(['Quan trọng', 'Khẩn cấp', 'Dài hạn']);
  const [darkMode, setDarkMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [activeMenu, setActiveMenu] = useState('today');
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesProject = filterProject === 'all' || todo.project === filterProject;
    const matchesTag = filterTag === 'all' || (todo.tags && todo.tags.includes(filterTag));
    const matchesMenu = 
      activeMenu === 'today' ? true :
      activeMenu === 'upcoming' ? todo.deadline && new Date(todo.deadline) > new Date() :
      activeMenu === 'completed' ? todo.completed : false;
    
    return matchesSearch && matchesProject && matchesTag && matchesMenu;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const progress = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`todoist-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className={`todoist-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">TodoList</h2>
        </div>
        <ul className="sidebar-menu">
          <li 
            className={`sidebar-menu-item ${activeMenu === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveMenu('inbox')}
          >
            <InboxOutlined />
            <span>Hộp thư đến</span>
          </li>
          <li 
            className={`sidebar-menu-item ${activeMenu === 'today' ? 'active' : ''}`}
            onClick={() => setActiveMenu('today')}
          >
            <CalendarOutlined />
            <span>Hôm nay</span>
          </li>
          <li 
            className={`sidebar-menu-item ${activeMenu === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveMenu('upcoming')}
          >
            <ClockCircleOutlined />
            <span>Sắp tới</span>
          </li>
          <li 
            className={`sidebar-menu-item ${activeMenu === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveMenu('completed')}
          >
            <CheckCircleOutlined />
            <span>Đã hoàn thành</span>
          </li>
        </ul>
      </div>

      <div className={`todoist-main ${isCollapsed ? 'expanded' : ''}`}>
        <div className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
        <div className="todoist-header">
          <div className="header-left">
            <h1>
              {activeMenu === 'inbox' ? 'Hộp thư đến' :
               activeMenu === 'today' ? 'Hôm nay' :
               activeMenu === 'upcoming' ? 'Sắp tới' :
               'Đã hoàn thành'}
            </h1>
            <span className="todo-count">{filteredTodos.length} công việc</span>
          </div>
          <div className="header-right">
            <Space>
              <Input.Search
                placeholder="Tìm kiếm..."
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 180 }}
              />
              <Button onClick={toggleDarkMode}>
                {darkMode ? 'Sáng' : 'Tối'}
              </Button>
              <Button onClick={handleLogout}>Đăng xuất</Button>
            </Space>
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
                  prefix={<PlusOutlined className="plus-icon" />}
                />
              </Form.Item>
            </Form>
          </div>

          <div className="todos-list">
            <List
              loading={loading}
              dataSource={filteredTodos}
              renderItem={todo => (
                <List.Item className="todo-item">
                  <div className="todo-content">
                    <Checkbox
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo._id, todo.completed)}
                      className="todo-checkbox"
                    />
                    <span className={`todo-title ${todo.completed ? 'completed' : ''}`}>
                      {todo.title}
                    </span>
                  </div>
                  <div className="todo-actions">
                    <Button 
                      type="text" 
                      icon={<EditOutlined />}
                      onClick={() => showEditModal(todo)}
                      className="edit-btn"
                    />
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(todo._id)}
                      className="delete-btn"
                    />
                  </div>
                </List.Item>
              )}
            />
          </div>

          {todos.length > 0 && (
            <div className="progress-section">
              <Progress
                percent={progress}
                status={progress === 100 ? 'success' : 'active'}
                className="todo-progress"
                showInfo={false}
              />
              <span className="progress-text">
                {progress}% hoàn thành
              </span>
            </div>
          )}
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
          form={editForm}
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
            <Button type="primary" htmlType="submit" block>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TodoList;
