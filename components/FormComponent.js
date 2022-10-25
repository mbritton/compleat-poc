import styles from '@/styles/Form.module.scss';
import { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';

// https://creativedesignsguru.com/next-js-formik/

const FormComponent = ({ children }) => {
  const [message, setMessage] = useState(''); // This will be used to show a message if the submission is successful
  const [submitted, setSubmitted] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      name: '',
      message: '',
    },
    onSubmit: () => {
      setMessage('Form submitted');
      setSubmitted(true);
    },
    validationSchema: yup.object({
      name: yup.string().trim().required('Name is required'),
      email: yup
        .string()
        .email('Must be a valid email')
        .required('Email is required'),
      message: yup.string().trim().required('Message is required'),
    }),
  });
  return (
    <div className={styles.hero}>
      <div hidden={!submitted} className="alert alert-primary" role="alert">
        {message}
      </div>
      <form action="/api/form" method="post" onSubmit={formik.handleSubmit}>
        <label htmlFor="first">First Name</label>
        <input type="text" id="first" name="first" required />

        <label htmlFor="last">Last Name</label>
        <input type="text" id="last" name="last" required />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default FormComponent;
