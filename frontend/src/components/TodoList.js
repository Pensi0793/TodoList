import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Form, Input, List, message, Progress, Modal, Checkbox, Select, DatePicker, Tag, Tooltip, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined, TagOutlined, ProjectOutlined, ExclamationCircleOutlined, MenuFoldOutlined, MenuUnfoldOutlined, CheckCircleOutlined, CalendarOutlined } from '@ant-design/icons';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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
      <div className={`todoist-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">TodoList</h2>
        </div>
        <ul className="sidebar-menu">
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

      <div className="todoist-main">
        <div className="todoist-header">
          <div className="header-left">
            <Button 
              type="text" 
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
              onClick={toggleSidebar}
            />
            <h1>
              {activeMenu === 'today' ? 'Hôm nay' :
               activeMenu === 'upcoming' ? 'Sắp tới' :
               'Đã hoàn thành'}
            </h1>
            <span className="todo-count">{filteredTodos.length} công việc</span>
          </div>
          <div className="header-right">
            <Space>
              <Input.Search
                placeholder="Tìm kiếm công việc..."
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 200 }}
              />
              <Select
                placeholder="Dự án"
                style={{ width: 120 }}
                onChange={setFilterProject}
                value={filterProject}
              >
                <Option value="all">Tất cả</Option>
                {projects.map(project => (
                  <Option key={project} value={project}>{project}</Option>
                ))}
              </Select>
              <Select
                placeholder="Tags"
                style={{ width: 120 }}
                onChange={setFilterTag}
                value={filterTag}
              >
                <Option value="all">Tất cả</Option>
                {tags.map(tag => (
                  <Option key={tag} value={tag}>{tag}</Option>
                ))}
              </Select>
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
                  prefix={<span className="plus-icon">+</span>}
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
              percent={progress}
              status={progress === 100 ? 'success' : 'active'}
              className="todo-progress"
              showInfo={false}
            />
            <span className="progress-text">
              {progress}% hoàn thành
            </span>
          </div>
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
