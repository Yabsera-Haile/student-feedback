// src/components/StudentCrud.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Table, Button, Modal, Form, Input, notification } from 'antd';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';

const { Header, Content, Sider } = Layout;

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000', 
});
interface IStudent {
  fullName: string;
  email: string;
  year: number;
  semester: number;
}

const validationSchema = yup.object({
  fullName: yup.string().required('Full Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  year: yup.number().required('Year is required'),
  semester: yup.number().required('Semester is required'),
});

const StudentCrud: React.FC = () => {
  const [students, setStudents] = useState<IStudent[]>([]);
  const [visible, setVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<IStudent | null>(null);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      year: 0,
      semester: 0,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingStudent) {
          // Edit student
          await axiosInstance.put(`/students/${editingStudent.email}`, values);
          notification.success({ message: 'Student updated successfully!' });
        } else {
          // Add new student
          await axiosInstance.post('/students', values);
          notification.success({ message: 'Student added successfully!' });
        }
        setVisible(false);
        formik.resetForm();
        fetchStudents();
      } catch (error) {
        notification.error({ message: 'Error saving student', description: error.message });
      }
    },
  });

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a: IStudent, b: IStudent) => a.fullName.localeCompare(b.fullName),
      
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: IStudent, b: IStudent) => a.email.localeCompare(b.email),
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      filters: [
        {
          text: 1,
          value: 1,
        },
        {
          text: 2,
          value: 2,
        },
        {
          text: 3,
          value: 3,
        },
        {
          text: 4,
          value: 4,
        },
        {
          text: 5,
          value: 5,
        },
      ],
      onFilter: (value: number, record: IStudent) => record.year === value,
      sorter: (a: IStudent, b: IStudent) => a.year - b.year,
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      filters: [
        {
          text: 1,
          value: 1,
        },
        {
          text: 2,
          value: 2,
        },
      ],
      onFilter: (value: number, record: IStudent) => record.semester === value,
      sorter: (a: IStudent, b: IStudent) => a.semester - b.semester,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: IStudent) => (
        <span>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" onClick={() => handleDelete(record.email)}>
            Delete
          </Button>
        </span>
      ),
    },
  ];

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get('/students');
      setStudents(response.data);
    } catch (error) {
      notification.error({ message: 'Error fetching students', description: error.message });
    }
  };

  const handleEdit = (student: IStudent) => {
    setEditingStudent(student);
    formik.setValues(student);
    setVisible(true);
  };

  const handleDelete = async (email: string) => {
    try {
      await axiosInstance.delete(`/students/${email}`);
      notification.success({ message: 'Student deleted successfully!' });
      fetchStudents();
    } catch (error) {
      notification.error({ message: 'Error deleting student', description: error.message });
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

return (
  <Layout style={{ minHeight: '100vh', minWidth: '100%' }}>
    <Sider width={200} theme="light">
    <Header className="site-layout-background" style={{ padding: '20px', color:'#fff', fontWeight: 500, fontSize: 20, display:'flex', alignItems: 'center' }}>
      <img src='./logo.jpg' alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
    </Header>
      <Menu mode="vertical" theme="light" style={{ borderRight: 0, marginTop:10 }}>
        <Menu.Item key="1">Students</Menu.Item>
        <Menu.Item key="2">Lecturers</Menu.Item>
        <Menu.Item key="3">Courses</Menu.Item>
        <Menu.Item key="4">Batches and Semester</Menu.Item>
      </Menu>
    </Sider>
    <Layout className="site-layout" style={{ width: '100%' }}>
      <Header className="site-layout-background" style={{ padding: '20px', color:'#fff', fontWeight: 500 }}>
        Students
      </Header>
      <Content style={{ margin: '24px' }}>
        <Button type="primary" onClick={() => setVisible(true)}>
          Add Student
        </Button>
        <Table dataSource={students} columns={columns} rowKey="email" style={{ marginTop: '24px' }} />

        <Modal
          title={editingStudent ? 'Edit Student' : 'Add Student'}
          open={visible}
          onCancel={() => {
            setVisible(false);
            setEditingStudent(null);
            formik.resetForm();
          }}
          footer={null}
        >
          <Form layout="vertical" onFinish={formik.handleSubmit}>
            <Form.Item label="Full Name" required>
              <Input name="fullName" value={formik.values.fullName} onChange={formik.handleChange} />
              {formik.touched.fullName && formik.errors.fullName && (
                <div style={{ color: '#b20000' }}>{formik.errors.fullName}</div>
              )}
            </Form.Item>
              <Form.Item label="Email" required>
                <Input name="email" value={formik.values.email} onChange={formik.handleChange} disabled={!!editingStudent} />
                {formik.touched.email && formik.errors.email && <div style={{ color: 'red' }}>{formik.errors.email}</div>}
              </Form.Item>
              <Form.Item label="Year" required>
                <Input type="number" name="year" value={formik.values.year} onChange={formik.handleChange} />
                {formik.touched.year && formik.errors.year && <div style={{ color: 'red' }}>{formik.errors.year}</div>}
              </Form.Item>
              <Form.Item label="Semester" required>
                <Input type="number" name="semester" value={formik.values.semester} onChange={formik.handleChange} />
                {formik.touched.semester && formik.errors.semester && (
                  <div style={{ color: 'red' }}>{formik.errors.semester}</div>
                )}
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  {editingStudent ? 'Update' : 'Add'}
                </Button>
              </Form.Item>
         </Form>
        </Modal>
      </Content>
    </Layout>
  </Layout>
);
};

export default StudentCrud;
// src/components/StudentCrud.tsx
// ...

// src/components/StudentCrud.tsx
// ...


 