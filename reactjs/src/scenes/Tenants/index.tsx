import { Card, Col, Row,  Button, Table, Tag, Dropdown, Menu } from 'antd';
import 'antd/dist/antd.css';
import *as React from 'react';
import { EntityDto } from 'src/services/dto/entityDto';
import CreateOrUpdateTenant from "./components/createOrUpdateTenant"
import { inject, observer } from 'mobx-react';
import { __await } from 'tslib';
import Stores from 'src/stores/storeIdentifier';
import TenantStore from 'src/stores/tenantStore';
import { L } from 'src/lib/abpUtility';

export interface ITenantProps {
  tenantStore: TenantStore;
}

@inject(Stores.TenantStore)
@observer
class Tenant extends React.Component<any> {
  formRef: any;
  constructor(props: any) {
    super(props);
  }
  state = {
    modalVisible: false,
    maxResultCount: 10,
    skipCount: 0,
    tenantId: 0,
  };

  async componentWillMount() {
    await this.getAll();
  }

  async getAll() {
    await this.props.tenantStore.getAll({ maxResultCount: this.state.maxResultCount, skipCount: this.state.skipCount });
  }
  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll());
  };

  Modal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  };

  async createOrUpdateModalOpen(entityDto: EntityDto) {
    if (entityDto.id == 0) {
      await this.props.tenantStore.createTenant();
    } else {
      await this.props.tenantStore.get(entityDto);
    }

    this.setState({ tenantId: entityDto.id });
    this.Modal();

    this.formRef.props.form.setFieldsValue({
      tenancyName: this.props.tenantStore.editTenant.tenancyName,
      name: this.props.tenantStore.editTenant.name,
      isActive: this.props.tenantStore.editTenant.isActive,
    });
  }

  delete(input: EntityDto) {
    this.props.tenantStore.delete(input);
  }

  handleCreate = () => {
    const form = this.formRef.props.form;
    form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      } else {
        if (this.state.tenantId == 0) {
          await this.props.tenantStore.create(values);
        } else {
          await this.props.tenantStore.update({ id: this.state.tenantId, ...values });
        }
      }
      await this.getAll();
      this.setState({ modalVisible: false });
      form.resetFields();
    });
  };

  saveFormRef = (formRef: any) => {
    this.formRef = formRef;
  };
  public render() {
    const { tenants } = this.props.tenantStore;
    const columns = [{ title: L('TenancyName'), dataIndex: 'tenancyName', key: 'tenancyName', width: 150, render: (text: string) => <div>
            {text}
          </div> }, { title: L('Name'), dataIndex: 'name', key: 'name', width: 150, render: (text: string) => <div>
            {text}
          </div> }, { title: L('IsActive'), dataIndex: 'isActive', key: 'isActive', width: 150, render: (text: boolean) => (text == true ? <Tag color="#2db7f5">
        {L('Yes')}
      </Tag> : <Tag color="red">{L('No')}</Tag>)
      }, {
        title: L('Actions'), width: 150, render: (text: string, item: any) => <div>
            <Dropdown trigger={['click']} overlay={<Menu>
                  <Menu.Item>
                    <a onClick={() => this.createOrUpdateModalOpen({ id: item.id })}>{L('Edit')}</a>
                  </Menu.Item>
                  <Menu.Item>
                    <a onClick={() => this.delete({ id: item.id })}>{L('Delete')}</a>
                  </Menu.Item>
                </Menu>} placement="bottomLeft">
              <Button type="primary" icon="setting">
                {L('Actions')}
              </Button>
            </Dropdown>
          </div> }];
    return <Card>
        <Row>
          <Col xs={{ span: 4, offset: 0 }} sm={{ span: 4, offset: 0 }} md={{ span: 4, offset: 0 }} lg={{ span: 2, offset: 0 }} xl={{ span: 2, offset: 0 }} xxl={{ span: 2, offset: 0 }}>
          <h2>{L('Tenants')}</h2>
          </Col>
          <Col xs={{ span: 14, offset: 0 }} sm={{ span: 15, offset: 0 }} md={{ span: 15, offset: 0 }} lg={{ span: 1, offset: 21 }} xl={{ span: 1, offset: 21 }} xxl={{ span: 1, offset: 21 }}>
            <Button type="primary" shape="circle" icon="plus" onClick={() => this.createOrUpdateModalOpen({ id: 0 })} />
          </Col>
        </Row>
        <Row style={{ marginTop: 20 }}>
          <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }} md={{ span: 24, offset: 0 }} lg={{ span: 24, offset: 0 }} xl={{ span: 24, offset: 0 }} xxl={{ span: 24, offset: 0 }}>
            <Table size={'default'} bordered={true} pagination={{ pageSize: this.state.maxResultCount, total: tenants == undefined ? 0 : tenants.totalCount, defaultCurrent: 1 }} columns={columns} loading={tenants == undefined ? true : false} dataSource={tenants == undefined ? [] : tenants.items} onChange={this.handleTableChange} />
          </Col>
        </Row>
        <CreateOrUpdateTenant wrappedComponentRef={this.saveFormRef} visible={this.state.modalVisible} onCancel={() => this.setState({
              modalVisible: false,
            })} modalType={this.state.tenantId == 0 ? 'edit' : 'create'} onCreate={this.handleCreate} />
      </Card>;
  }
}

export default Tenant;
