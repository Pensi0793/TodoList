import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Form, Input, Button, List, message, Modal, Progress, Checkbox, Select, DatePicker, Tag, Tooltip, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined, TagOutlined, ProjectOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import './TodoList.css';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

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

  const apiUrl = 'https://todolist-h26x.onrender.com';

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
      if (err.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setToken(null);
        localStorage.removeItem('token');
      } else {
        message.error('Không thể tải danh sách công việc');
      }
    } finally {
      setLoading(false);
    }
  }, [token, setToken]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAddTodo = async (values) => {
    try {
      const res = await axios.post(
        `${apiUrl}/api/todos`,
        {
          title: values.title,
          project: values.project,
          deadline: values.deadline?.format('YYYY-MM-DD'),
          priority: values.priority,
          tags: values.tags,
          description: values.description
        },
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
      message.success('Thêm công việc thành công!');
    } catch (err) {
      message.error('Không thể thêm công việc');
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/todos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      setTodos(todos.filter(todo => todo._id !== id));
      message.success('Xóa công việc thành công!');
    } catch (err) {
      message.error('Không thể xóa công việc');
    }
  };

  const handleEditTodo = async (values) => {
    try {
      const res = await axios.put(
        `${apiUrl}/api/todos/${editingTodo._id}`,
        {
          title: values.title,
          project: values.project,
          deadline: values.deadline?.format('YYYY-MM-DD'),
          priority: values.priority,
          tags: values.tags,
          description: values.description
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      setTodos(todos.map(todo => todo._id === editingTodo._id ? res.data : todo));
      setIsModalVisible(false);
      message.success('Cập nhật công việc thành công!');
    } catch (err) {
      message.error('Không thể cập nhật công việc');
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
      setTodos(todos.map(todo => todo._id === id ? res.data : todo));
    } catch (err) {
      message.error('Không thể cập nhật trạng thái công việc');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesProject = filterProject === 'all' || todo.project === filterProject;
    const matchesTag = filterTag === 'all' || (todo.tags && todo.tags.includes(filterTag));
    return matchesSearch && matchesProject && matchesTag;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const progress = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div className={`todoist-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="todoist-header">
        <div className="header-left">
          <h1>Hôm nay</h1>
          <span className="todo-count">{todos.length} công việc</span>
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
          <Form form={form} onFinish={handleAddTodo} className="add-todo-form">
            <Form.Item name="title" rules={[{ required: true, message: 'Vui lòng nhập công việc!' }]}>
              <Input
                className="todo-input"
                placeholder="Thêm công việc mới..."
                prefix={<PlusOutlined className="plus-icon" />}
              />
            </Form.Item>
            <Form.Item name="project">
              <Select placeholder="Chọn dự án">
                {projects.map(project => (
                  <Option key={project} value={project}>{project}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="deadline">
              <DatePicker placeholder="Hạn chót" />
            </Form.Item>
            <Form.Item name="priority">
              <Select placeholder="Độ ưu tiên">
                <Option value="high">Cao</Option>
                <Option value="medium">Trung bình</Option>
                <Option value="low">Thấp</Option>
              </Select>
            </Form.Item>
            <Form.Item name="tags">
              <Select mode="multiple" placeholder="Tags">
                {tags.map(tag => (
                  <Option key={tag} value={tag}>{tag}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="description">
              <TextArea placeholder="Mô tả" rows={2} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
            </Form.Item>
          </Form>
        </div>

        <List
          className="todos-list"
          loading={loading}
          dataSource={filteredTodos}
          renderItem={todo => (
            <List.Item className="todo-item">
              <div className="todo-content">
                <Checkbox
                  className="todo-checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo._id, todo.completed)}
                />
                <div className="todo-details">
                  <h3 className={`todo-title ${todo.completed ? 'completed' : ''}`}>
                    {todo.title}
                  </h3>
                  <div className="todo-meta">
                    {todo.project && (
                      <Tag icon={<ProjectOutlined />} color="blue">
                        {todo.project}
                      </Tag>
                    )}
                    {todo.deadline && (
                      <Tag icon={<ClockCircleOutlined />} color="orange">
                        {new Date(todo.deadline).toLocaleDateString()}
                      </Tag>
                    )}
                    {todo.priority && (
                      <Tag color={
                        todo.priority === 'high' ? 'red' :
                        todo.priority === 'medium' ? 'orange' : 'green'
                      }>
                        {todo.priority}
                      </Tag>
                    )}
                    {todo.tags && todo.tags.map(tag => (
                      <Tag key={tag} icon={<TagOutlined />}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                  {todo.description && (
                    <p className="todo-description">{todo.description}</p>
                  )}
                </div>
              </div>
              <div className="todo-actions">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingTodo(todo);
                    editForm.setFieldsValue({
                      title: todo.title,
                      project: todo.project,
                      deadline: todo.deadline ? moment(todo.deadline) : null,
                      priority: todo.priority,
                      tags: todo.tags,
                      description: todo.description
                    });
                    setIsModalVisible(true);
                  }}
                  className="edit-btn"
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Xác nhận xóa',
                      icon: <ExclamationCircleOutlined />,
                      content: 'Bạn có chắc chắn muốn xóa công việc này?',
                      okText: 'Xóa',
                      cancelText: 'Hủy',
                      onOk: () => handleDeleteTodo(todo._id)
                    });
                  }}
                  className="delete-btn"
                />
              </div>
            </List.Item>
          )}
        />

        <div className="progress-section">
          <Progress
            className="todo-progress"
            percent={progress}
            size="small"
            showInfo={false}
          />
          <span className="progress-text">{progress}% hoàn thành</span>
        </div>
      </div>

      <Modal
        title="Chỉnh sửa công việc"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="edit-modal"
      >
        <Form form={editForm} onFinish={handleEditTodo}>
          <Form.Item name="title" rules={[{ required: true, message: 'Vui lòng nhập công việc!' }]}>
            <Input className="edit-input" />
          </Form.Item>
          <Form.Item name="project">
            <Select placeholder="Chọn dự án">
              {projects.map(project => (
                <Option key={project} value={project}>{project}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="deadline">
            <DatePicker placeholder="Hạn chót" />
          </Form.Item>
          <Form.Item name="priority">
            <Select placeholder="Độ ưu tiên">
              <Option value="high">Cao</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="low">Thấp</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tags">
            <Select mode="multiple" placeholder="Tags">
              {tags.map(tag => (
                <Option key={tag} value={tag}>{tag}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description">
            <TextArea placeholder="Mô tả" rows={2} />
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
