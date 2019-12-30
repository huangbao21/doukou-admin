import React, { Component, Fragment } from 'react';
import { parse, stringify } from 'qs';
import config from '@/config';
import { PageHeader, Card, Form, DatePicker, Row, Col, Input, InputNumber, Button, Divider, Tag, Select, Modal, message, Icon, Tabs, Cascader, Upload, Radio, Checkbox, Tooltip, Popconfirm } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
import Styles from './style.less';
import ImgCrop from 'antd-img-crop';
import { fetchOSSPolicy } from '@/services/oss'
import { fetchAllList } from '@/services/course'
import { createProduct, fetchInfo, updateProduct } from '@/services/product'
import InlineButton from '@/components/InlineButton';
import Helper from '@/utils/helper';

const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
const { Option } = Select
const { confirm } = Modal
const TextArea = Input.TextArea

@Form.create()
@connect(({ mall, product, loading }) => ({
  groupList: mall.groupList,
  categoryTreeList: product.categoryTreeList,
  loading: loading.models.product
}
))
export default class Add extends Component {
  state = {
    previewVisible: false,
    previewImage: '',
    viewSwitch: false,
    albumHost: '',
    albumOssdata: null,
    batchPrice: 1,
    batchStock: 1,
    varietyArray: [],
    services: [],
    currentItem: {},
    // 每一行是一组元素，顺序为从上到下
    varietyInput: []
  }

  componentDidMount() {
    const { dispatch, location } = this.props;
    dispatch({
      type: 'mall/fetchGroup',
      payload: {}
    })
    dispatch({
      type: 'product/fetchProductCategoryTreeList',
      payload: {}
    })
    fetchAllList({ type: 22, relationType: 2 }).then(res => {
      this.setState({
        services: res
      })
    })
    if (location.query.id) {

      fetchInfo(location.query.id).then(res => {
        if (res) {
          let viewSwitch = false;
          let albumPics = res.albumPics.split(',');
          res.albumPics = albumPics.map((item, index) => { return { url: item, status: 'done', uid: `rc-done-${item.name}-${index}` } })
          if (res.descrition || res.detailDesc) {
            viewSwitch = true;
            let detailDesc = res.detailDesc.split(',');
            res.detailDesc = detailDesc.map((item, index) => {
              return { url: item, status: 'done', uid: `rc-done-${item.name}-${index}` }
            })
          }
          this.setState({ currentItem: res, viewSwitch, varietyArray: res.attributeParamList, varietyInput: res.pmsSkuStockVOList })
        }
      })
    }
  }
  normFile = e => {
    if (Array.isArray(e)) {
      return e;
    }
    if (e) {
      e.fileList.sort((a, b) => {
        if (!a.uid || !b.uid) return 0
        let tempA = a.uid.split('-');
        let tempB = b.uid.split('-');
        return tempA[3] - tempB[3]
      })
    }
    return e && e.fileList
  }
  beforeUploadSingle = (file, i, index, arry) => {
    const { varietyArray } = this.state;
    let tempArry = varietyArray[i].attributeValueList.length > 0 ? varietyArray[i].attributeValueList : arry;
    let item = tempArry[index];

    return fetchOSSPolicy(file.name).then(res => {
      if (res) {
        item.ossData = res.ossData;
        item.host = res.host;
        varietyArray[i].attributeValueList = tempArry;
        this.setState({
          varietyArray: varietyArray
        })
      }
    })
  }
  handleImageChangeSingle = (info, i, index, arry) => {
    const { varietyArray } = this.state;
    let tempArry = varietyArray[i].attributeValueList.length > 0 ? varietyArray[i].attributeValueList : arry;
    let item = tempArry[index];
    if (info.file.status === 'uploading') {
      item.uploadLoading = true
      varietyArray[i].attributeValueList = tempArry;
      this.setState({
        varietyArray: varietyArray
      })
      return;
    }
    if (info.file.status === 'done') {
      item.uploadLoading = false
      item.imageUrl = `${item.host}/${item.ossData.key}`
      varietyArray[i].attributeValueList = tempArry;
      this.setState({
        varietyArray: varietyArray
      })
    }

  }
  beforeUpload = (file) => {
    return fetchOSSPolicy(file.name).then(async res => {
      if (res) {
        file.ossData = res.ossData;
        await Helper.setFileScale(file);
        this.setState({
          albumOssdata: res.ossData,
          albumHost: res.host
        })
      }
    })
  }
  handleImageChange = (info) => {
    const { albumHost, albumOssdata } = this.state;
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      info.fileList.map(file => {
        if (!file.url) {
          if (!file.originFileObj.width) {
            console.log('出错了', 3)
            file.url = `${albumHost}/${file.ossData.key}?750*750`
          }
          file.url = `${albumHost}/${file.ossData.key}?${file.originFileObj.width}*${file.originFileObj.height}`
        }
      })
      console.warn(info.fileList, 'done')
    }
  }
  cascaderData = (arry) => {
    let data = [];
    data = arry.map(item => {
      item.value = item.id;
      item.label = item.name;
      item.children = item.children.length > 0 && this.cascaderData(item.children);
      return item;
    })
    return data;
  }

  addVariety = (arry, index) => {
    if (index == 0 || index) {
      // 添加规格值
      let obj = {
        value: '',
        imageUrl: ''
      }
      arry[index].attributeValueList.push(obj);
    } else {
      // 添加规格字段
      let obj = {
        name: '',
        haveIcon: 0,
        attributeValueList: [{
          value: '',
          imageUrl: ''
        }]
      }
      arry.push(obj);
    }
    this.setState({
      varietyArray: arry,
    })
  }
  removeVariety = (arry, index, cindex) => {
    // 删除规格值
    if (cindex == 0 || cindex) {
      arry[index].attributeValueList.splice(cindex, 1);
    } else {
      // 删除规格字段
      arry.splice(index, 1);
    }
    if (arry.length == 0) {
      this.setState({
        varietyInput: []
      })
    }
    console.log(arry, 'arry')
    this.setState({
      varietyArray: arry
    })
  }
  /**
   * pindex: 直接父级下标
   * parry: 直接父级数据源
   */
  handleValueChange = (index, name, value, arry, pindex, parry) => {
    arry[index][name] = value
    if (parry && parry.length > 0) {
      parry[pindex].attributeValueList = arry;
      this.setState({
        varietyArray: parry
      })

    } else {
      this.setState({
        varietyArray: arry
      })
    }
  }
  handleSkuBlur = (e, yindex) => {
    const { varietyInput } = this.state;

    let name = e.target.name;
    let value = e.target.value;
    if (name != 'skuCode') {
      value = value > 0 ? value : 1;
    }
    if (name == 'stock') {
      value = Math.ceil(value);
    }
    varietyInput[yindex][name] = value;
    this.setState({
      varietyInput
    })
  }
  handleSkuChange = (e, yindex) => {
    const { varietyInput } = this.state;

    let name = e.target.name;
    let value = e.target.value;
    // if (name != 'skuCode') {
    //   value = value > 0 ? value : 1;
    // }
    // if (name == 'stock') {
    //   value = Math.ceil(value);
    // }
    varietyInput[yindex][name] = value;
    this.setState({
      varietyInput
    })
  }
  batchSetting = (name) => {
    const { batchPrice, batchStock, varietyInput } = this.state;
    let value = name == 'price' ? batchPrice : batchStock;
    varietyInput.map(item => {
      return item[name] = value
    })
    this.setState({ varietyInput })

  }
  handleSave = (publishStatus = 0) => {
    const { form, location: { query } } = this.props
    const { varietyArray, varietyInput } = this.state;
    form.validateFields((err, fieldValue) => {
      if (err) return;
      fieldValue.publishStatus = publishStatus;
      fieldValue.albumPics = fieldValue.albumPics.map(item => item.url).join(',');
      fieldValue.detailDesc = fieldValue.detailDesc && fieldValue.detailDesc.map(item => item.url).join(',')
      fieldValue.attributeParamList = varietyArray;
      fieldValue.pmsSkuStockVOList = varietyInput;
      fieldValue.id = query.id;
      let fetch = query.id ? updateProduct : createProduct
      fetch(fieldValue).then(res => {
        if (res) {
          router.goBack(-1);
        }
      })
    })

  }
  dragStart = (event) => {
    console.log(event, 'start')
  }
  drop = (event) => {
    event.preventDefault();
    console.log(event, 'drop')
  }
  dragOver = (event) => {
    event.preventDefault();
  }
  dragEnter = (event) => {
    console.log(event.target, 'enter')
    event.target.style.boder = '2px dashed #008dff';
    event.target.style.boxShadow = '0 0 8px rgba(30, 144, 255, 0.8)';
  }
  renderVarietyDetailHead = (arry) => {
    let dynamicNodes = arry.map((item, index) => {
      return <div className={Styles.col} key={index}>{item.name}</div>
    })
    return (<>
      {dynamicNodes}
      <div className={Styles.col}><span className={Styles.required}>价格</span></div>
      <div className={Styles.col}><span className={Styles.required}>库存</span></div>
      <div className={Styles.col}>成本价</div>
      <div className={Styles.col}>商品编码</div></>)
  }
  renderVarietyDetailCell = (arry) => {
    const { varietyInput } = this.state;
    console.log(varietyInput, 'varietyInput')
    if (arry.length == 0) return;
    // 每个元素数值代表第一行每列的单元格个数
    let lengthArry = [];
    arry.map((item, index) => {
      if (index != 0) {
        item.tempLength = item.attributeValueList.length * arry[index - 1].tempLength;
        lengthArry.push(item.tempLength);
      } else {
        item.tempLength = 1;
        lengthArry.push(item.tempLength)
      }
    })
    let nodes = [];
    function getColData(colData, colDataIndex, tempNode = []) {
      colData.attributeValueList.map((item, index, odata) => {
        let colNode = <div key={index + `temp${tempNode.length}`} className={Styles.colValue}>{item.value}</div>
        tempNode.push(colNode);
        if (index == odata.length - 1) {
          if (tempNode.length < lengthArry[colDataIndex]) {
            getColData(colData, colDataIndex, tempNode);
          } else {
            nodes.push(tempNode);
          }
        }
      })

    }
    for (let i = 1; i < arry.length; i++) {
      getColData(arry[i], i);
    }
    // set varietyInput 
    let varietyInputLength;
    if (nodes.length == 0) {
      varietyInputLength = 1 * arry[0].attributeValueList.length;
    } else {
      varietyInputLength = nodes[nodes.length - 1].length * arry[0].attributeValueList.length;
    }
    if (varietyInputLength < varietyInput.length) {
      let diff = varietyInput.length - varietyInputLength;
      varietyInput.splice(varietyInputLength, diff)
    } else {
      for (let j = varietyInput.length; j < varietyInputLength; j++) {
        let obj = {
          price: 1,
          stock: 1,
          costPrice: 1,
          skuCode: ''
        }
        varietyInput.push(obj);
      }
    }

    return arry[0].attributeValueList.map((item, index) => {
      return (
        <div key={index} className={Styles.row}>
          <div className={Styles.col}>
            <div className={Styles.colValue}>{item.value}</div>
          </div>
          {nodes.map((node, nodeIndex) => {
            return <div key={nodeIndex} className={Styles.col}>{node}</div>
          })}
          {/* 渲染后4个固定列 */}
          {nodes.length > 0 ? [{ name: 'price' }, { name: 'stock' }, { name: 'costPrice' }, { name: 'skuCode' }].map((num, numIndex) => {
            return <div key={numIndex} className={Styles.col}>
              {nodes[nodes.length - 1].map((nodeNum, nodeNumIndex, onode) => {
                return <div key={nodeNumIndex} className={Styles.colValue}><Input name={num.name} value={varietyInput[index * onode.length + nodeNumIndex][num.name]} onBlur={e => {
                  this.handleSkuBlur(e, index * onode.length + nodeNumIndex)
                }} onChange={e => {
                  this.handleSkuChange(e, index * onode.length + nodeNumIndex)
                }} /></div>
              })}
            </div>
          }) : [{ name: 'price' }, { name: 'stock' }, { name: 'costPrice' }, { name: 'skuCode' }].map((num, numIndex) => {
            return <div key={numIndex} className={Styles.col}>
              <div className={Styles.colValue}><Input name={num.name} value={varietyInput[index][num.name]} onBlur={e => { this.handleSkuBlur(e, index) }} onChange={(e) => {
                this.handleSkuChange(e, index)
              }} /></div>
            </div>
          })}

        </div>
      )
    })
  }


  render() {
    const { form, groupList = [], categoryTreeList = [] } = this.props;
    const { albumOssdata, albumHost, previewVisible, previewImage, viewSwitch, services, varietyArray, batchPrice, batchStock, currentItem } = this.state;
    let groupOptions = [];
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">图片上传</div>
      </div>
    );
    // 商品规格
    let varietyArrayData = varietyArray.length > 0 ? varietyArray : []
    // let varietyArrayData = varietyArray.length > 0 ? varietyArray : clearVariety ? [] : currentItem.attributeParamList ? currentItem.attributeParamList : [];
    // 商品分组
    groupOptions = groupList.map(item => {
      return <Option key={item.id} value={item.id}>{item.groupName}</Option>
    })

    return <PageHeader title="添加商品" onBack={() => {
      confirm({
        title: '返回将导致数据丢失，是否确定返回？',
        onOk: () => {
          router.goBack(-1);
        }
      })
    }}>
      <div className={Styles.wrap}>
        <Card className={Styles.card} title="基本信息">
          <FormItem label="商品名称" labelCol={{ span: 3 }} wrapperCol={{ span: 8 }}>
            {form.getFieldDecorator('name', {
              rules: [{ required: true, message: '请输入名称' }],
              initialValue: currentItem.name
            })(
              <Input placeholder="请输入" />
            )}
          </FormItem>
          <FormItem label="商品分类" labelCol={{ span: 3 }} wrapperCol={{ span: 8 }}>
            {form.getFieldDecorator('productCategoryIdsList', {
              rules: [{ required: true, message: '请选择' }],
              initialValue: currentItem.productCategoryIdsList
            })(
              <Cascader style={{ width: '100%' }} options={this.cascaderData(categoryTreeList)} placeholder="请选择"></Cascader>
            )}
          </FormItem>
          <FormItem label="商品分组" labelCol={{ span: 3 }} wrapperCol={{ span: 8 }}>
            {form.getFieldDecorator('groupIds', {
              initialValue: currentItem.groupIds ? currentItem.groupIds : []
            })(
              <Select style={{ width: '100%' }} placeholder="请选择"
                mode="multiple">
                {groupOptions}
              </Select>
            )}
          </FormItem>
          <FormItem label="货源" labelCol={{ span: 3 }} wrapperCol={{ span: 8 }}>
            {form.getFieldDecorator('sourceSupply', {
              initialValue: currentItem.sourceSupply ? currentItem.sourceSupply : ''
            })(
              <Select style={{ width: '100%' }} placeholder="请选择">
                <Option value='z'>自营</Option>
                <Option value='m'>美大大</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="序号" labelCol={{ span: 3 }} wrapperCol={{ span: 8 }} help='影响列表排序。若非特殊商品，建议设默认值0。'>
            {form.getFieldDecorator('sort', {
              initialValue: currentItem.sort || 0
            })(
              <InputNumber style={{ width: '100%' }} min={0} />
            )}
          </FormItem>
          <FormItem label="商品属性" labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
            <div className={Styles.goodsProps}>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="品牌" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
                    {form.getFieldDecorator('brandName', {
                      initialValue: currentItem.brandName
                    })(
                      <Input />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="功效" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
                    {form.getFieldDecorator('efficacy', {
                      initialValue: currentItem.efficacy
                    })(
                      <Input />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="孕妇可用" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
                    {form.getFieldDecorator('freshAvailable', {
                      initialValue: currentItem.freshAvailable
                    })(
                      <Input />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="适用肤质" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
                    {form.getFieldDecorator('suitableSkin', {
                      initialValue: currentItem.suitableSkin
                    })(
                      <Input />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="材质" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
                    {form.getFieldDecorator('material', {
                      initialValue: currentItem.material
                    })(
                      <Input />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="规格类型" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
                    {form.getFieldDecorator('specificationsTypes', {
                      initialValue: currentItem.specificationsTypes
                    })(
                      <Input />
                    )}
                  </FormItem>
                </Col>
              </Row>

            </div>
          </FormItem>
          <FormItem label="商品轮播" labelCol={{ span: 3 }} wrapperCol={{ span: 8 }}>
            {form.getFieldDecorator('albumPics', {
              rules: [{ required: true, message: '请上传图片' }],
              valuePropName: 'fileList',
              getValueFromEvent: this.normFile,
              initialValue: currentItem.albumPics ? currentItem.albumPics : []
            })(
              <Upload
                accept="image/*"
                name="file"
                multiple={true}
                listType="picture-card"
                onPreview={(file) => {
                  this.setState({
                    previewImage: file.url,
                    previewVisible: true
                  })
                }}
                beforeUpload={(file) => this.beforeUpload(file)}
                data={albumOssdata}
                onChange={this.handleImageChange}
                action={albumHost}
              >
                {uploadButton}
              </Upload>

            )}
          </FormItem>
          {viewSwitch && <>
            <FormItem label="商品描述" labelCol={{ span: 3 }} wrapperCol={{ span: 8 }}>
              {form.getFieldDecorator('description', {
                initialValue: currentItem.description || ''
              })(
                <TextArea maxLength="200" rows={6}></TextArea>
              )}剩{200 - form.getFieldValue('description').length}字
            </FormItem>
            <FormItem label="商品详情图" labelCol={{ span: 3 }} wrapperCol={{ span: 8 }}>
              {form.getFieldDecorator('detailDesc', {
                valuePropName: 'fileList',
                getValueFromEvent: this.normFile,
                initialValue: currentItem.detailDesc ? currentItem.detailDesc : []
              })(
                <Upload
                  accept="image/*"
                  name="file"
                  multiple={true}
                  listType="picture-card"
                  onPreview={(file) => {
                    this.setState({
                      previewImage: file.url,
                      previewVisible: true
                    })
                  }}
                  beforeUpload={(file) => this.beforeUpload(file)}
                  data={albumOssdata}
                  onChange={this.handleImageChange}
                  action={albumHost}
                >
                  {uploadButton}
                </Upload>
              )}
            </FormItem>
          </>
          }
          <FormItem>
            <Row>
              <Col span={3} style={{ textAlign: 'right' }}>
                <InlineButton onClick={() => { this.setState({ viewSwitch: !viewSwitch }) }}>{viewSwitch ? '收起' : '添加图文详情'} {viewSwitch ? <Icon type="up" /> : <Icon type="down" />}</InlineButton>
              </Col>
            </Row>
          </FormItem>
        </Card>
        <Card className={Styles.card} title="商品规格与库存">
          <FormItem label="商品类型" labelCol={{ span: 3 }} wrapperCol={{ span: 8 }}>
            {form.getFieldDecorator('productStyle', {
              initialValue: currentItem.productStyle || 1
            })(
              <Radio.Group>
                <Radio.Button value={1}>单规格</Radio.Button>
                <Radio.Button value={2}>多规格</Radio.Button>
              </Radio.Group>
            )}
          </FormItem>
          {form.getFieldValue('productStyle') == 2 && <FormItem label="商品规格" labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
            <div className={Styles.variety}>
              {varietyArrayData.map((item, i) => {
                return (
                  <div key={i} className={Styles.varietyItem}>
                    <FormItem label="规格名" labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
                      <Row gutter={16}>
                        <Col span={4}>
                          <Input value={item.name} name="name" onChange={(event) => {
                            this.handleValueChange(i, event.target.name, event.target.value, varietyArrayData)
                          }} />
                        </Col>
                        {i == 0 && <Col span={6}>
                          <Checkbox checked={item.haveIcon == 1} onChange={(event) => {
                            let v = event.target.checked ? 1 : 0
                            this.handleValueChange(i, event.target.name, v, varietyArrayData)
                          }} name="haveIcon" /> 添加规格图片
                    </Col> || <Col span={6}></Col>}

                        <Col span={14} style={{ textAlign: 'right' }}>
                          <InlineButton onClick={() => {
                            this.removeVariety(varietyArrayData, i)
                          }}>删除</InlineButton>
                        </Col>
                      </Row>
                    </FormItem>
                    <div className={Styles.varietyValue}>
                      <FormItem label="规格值" labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
                        <Row gutter={16}>
                          {item.attributeValueList.map((aitem, index) => {
                            return (
                              <Col key={index} span={4}>
                                <Input value={aitem.value} name="value" onChange={(event) => {
                                  this.handleValueChange(index, event.target.name, event.target.value, item.attributeValueList, i, varietyArrayData)
                                }} suffix={<Icon onClick={() => { this.removeVariety(varietyArrayData, i, index) }} type="close-circle" />} />

                                {item.haveIcon == 1 && <Upload
                                  accept="image/*"
                                  name="file"
                                  listType="picture-card"
                                  showUploadList={false}
                                  beforeUpload={(file) => this.beforeUploadSingle(file, i, index, aitem.attributeValueList)}
                                  data={aitem.ossData}
                                  onChange={(info) => this.handleImageChangeSingle(info, i, index, aitem.attributeValueList)}
                                  action={aitem.host}>
                                  {aitem.imageUrl ? <img style={{ width: '100%' }} src={aitem.imageUrl} /> : uploadButton}
                                </Upload>}
                              </Col>
                            )
                          })}
                          <Col span={6}>
                            {varietyArrayData[i].attributeValueList.length <= 10 &&
                              <InlineButton onClick={() => {
                                this.addVariety(varietyArrayData, i)
                              }}>添加规格值</InlineButton>
                            }

                          </Col>
                        </Row>
                      </FormItem>
                    </div>
                  </div>
                )
              })}

              <div style={{ marginTop: '10px', marginLeft: '10px' }}>
                <Button disabled={varietyArrayData.length >= 3} type='primary' onClick={() => {
                  this.addVariety(varietyArrayData)
                }}><Icon type="plus" />添加规格字段</Button>
              </div>
            </div>
          </FormItem>}
          {form.getFieldValue('productStyle') == 2 && varietyArrayData.length > 0 && <FormItem label="规格明细" labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>

            <div className={Styles.varietyDetail}>
              <div className={Styles.value}>
                <div className={Styles.dynamic}>
                  <div className={Styles.row}>
                    {this.renderVarietyDetailHead(varietyArrayData)}
                  </div>
                  {this.renderVarietyDetailCell(varietyArrayData)}
                </div>
              </div>
              <div className={Styles.batchAction}>
                <span>批量设置</span>
                <Popconfirm
                  icon={null}
                  title={<Input value={batchPrice} onChange={(e) => {
                    this.setState({ batchPrice: e.target.value > 0 ? e.target.value : 1 })
                  }} />}
                  onConfirm={() => { this.batchSetting('price') }}
                >
                  <a>价格</a>
                </Popconfirm>
                <Popconfirm
                  icon={null}
                  title={<Input value={batchStock} onChange={(e) => {
                    this.setState({ batchStock: Math.ceil(e.target.value > 0 ? e.target.value : 1) })
                  }} />}
                  onConfirm={() => { this.batchSetting('stock') }}
                >
                  <a>库存</a>
                </Popconfirm>
              </div>
            </div>
          </FormItem>}
          <Row>
            {form.getFieldValue('productStyle') == 1 && <Col span={5}>
              <FormItem label="商品价格" labelCol={{ span: 14 }} wrapperCol={{ span: 10 }}>
                {form.getFieldDecorator('price', {
                  rules: [{ required: true, message: '请输入' }],
                  initialValue: currentItem.price
                })(
                  <InputNumber min={0} />
                )} 元
              </FormItem>
            </Col>}

            <Col span={5}>
              <FormItem label="划线价" labelCol={{ span: 14 }} wrapperCol={{ span: 10 }}>
                {form.getFieldDecorator('linePrice', {
                  rules: [{ required: true, message: '请输入' }],
                  initialValue: currentItem.linePrice
                })(
                  <InputNumber min={0} />
                )} 元
              </FormItem>
            </Col>
          </Row>
          <Row>
            {form.getFieldValue('productStyle') == 1 && <Col span={5}>
              <FormItem label="库存" labelCol={{ span: 14 }} wrapperCol={{ span: 10 }}>
                {form.getFieldDecorator('stock', {
                  rules: [{ required: true, message: '请输入' }],
                  initialValue: currentItem.stock
                })(
                  <InputNumber min={0} />
                )} 个
              </FormItem>
            </Col>}

            {form.getFieldValue('productStyle') == 1 && <Col span={5}>
              <FormItem label="商品编码" labelCol={{ span: 14 }} wrapperCol={{ span: 10 }}>
                {form.getFieldDecorator('productSn', {
                  initialValue: currentItem.productSn
                })(
                  <Input />
                )}
              </FormItem>
            </Col>}
          </Row>
          <FormItem label="减库存方式" labelCol={{ span: 3 }} wrapperCol={{ span: 8 }}>
            {form.getFieldDecorator('delStockStyle', {
              initialValue: 1
            })(
              <Radio.Group>
                <Radio value={1}>付款减库存</Radio>
              </Radio.Group>
            )}
          </FormItem>
        </Card>
        <Card className={Styles.card} title="物流及服务">
          <FormItem label="快递运费" labelCol={{ span: 3 }} wrapperCol={{ span: 8 }}>
            {form.getFieldDecorator('expressFreight', {
              initialValue: 1
            })(
              <Radio.Group>
                <Radio value={1}>包邮</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem label="服务承诺" labelCol={{ span: 3 }} wrapperCol={{ span: 10 }}>
            {form.getFieldDecorator('serviceIdList', {
              rules: [{ required: true, message: '请选择' }],
              initialValue: currentItem.serviceIdList
            })(
              <Checkbox.Group style={{ width: '100%', lineHeight: '40px' }}>
                {services.map((item) => {
                  return (<Checkbox key={item.id} value={item.id}>{item.name}
                    <Tooltip title={item.descrition}>
                      <Icon style={{ marginLeft: '10px' }} type="question-circle" />
                    </Tooltip>
                  </Checkbox>)
                })}
              </Checkbox.Group>
            )}
          </FormItem>
          <div className={Styles.footAction}>

            <Button type="primary" style={{ marginRight: '20px' }} onClick={() => { this.handleSave(1) }}>{currentItem.publishStatus == 1 ? '保存' : '保存并上架'}</Button>
            {
              currentItem.publishStatus == 1 ? null : <Button onClick={() => { this.handleSave() }}>保存</Button>
            }
          </div>
        </Card>
      </div>
      <Modal visible={previewVisible} footer={null} onCancel={() => { this.setState({ previewVisible: false }) }}>
        <img style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </PageHeader>
  }
}