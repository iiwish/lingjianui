import React from 'react';
import { Modal, Form, Input, Switch, message } from 'antd';
import { AppService } from '~/services/app';
import type { App } from '~/types/app';
import { c } from 'node_modules/vite/dist/node/types.d-aGj9QkWt';
import AppForm from './AppForm';

interface AppSettingsModalProps {
    visible: boolean;
    onClose: () => void;
    app: App;
    onSuccess: () => void;
}

const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
    visible,
    onClose,
    app,
    onSuccess
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    const handleFinish = async (values: any) => {
        try {
            setLoading(true);
            // 更新应用信息的逻辑
            const response = await AppService.updateApp(String(app.id), {
                name: values.name,
                code: values.code,
                description: values.description
            });

            if (response.code === 200) {
                message.success('应用设置更新成功');
                onSuccess();
                onClose();
            } else {
                message.error(response.message || '更新失败');
            }
        } catch (error) {
            console.error('Form validation failed:', error);
            message.error('操作失败');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (visible && app) {
            form.setFieldsValue({
                name: app.name,
                code: app.code,
                description: app.description,
            });
        }
    }, [visible, app, form]);

    return (
        <Modal
            title="应用设置"
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={500}
        >
            <AppForm form={form} onFinish={handleFinish} />
        </Modal>
    );
};

export default AppSettingsModal;
