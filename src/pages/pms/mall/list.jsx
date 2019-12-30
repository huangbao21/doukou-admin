import React, { Component } from 'react';
import config from '@/config';
import { connect } from 'dva'
import { PageHeader, Carousel, Icon, Button, Spin } from 'antd';
import TitleCarousel from './components/titleCarousel'
import { fetchPart, delModules} from '@/services/mall'
import Styles from './style.less'
import TitleGoods from './components/titleGoods';
import Variant from './components/Variant';

@connect(({ mall, loading }) => ({
  moduleList: mall.moduleList,
  loading: loading.models.mall
}))
/**
 * @author bj
 */
export default class HomePage extends Component {

  state = {
    contentType: '',
    detailModule: [],
    saveData: [],
    moduleList: {}
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.moduleList != nextProps.moduleList) {
      this.setState({ moduleList: nextProps.moduleList })
    }
  }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mall/fetchModules',
      payload: {}
    })
    dispatch({
      type: 'mall/fetchGroup',
      payload: {}
    })
    dispatch({
      type: 'mall/fetchProductAll',
      payload: {}
    })
  }

  resetData = () => {
    this.setState({
      contentType: '',
      detailModule: [],
    })

  }

  /**
   * type: 无标题轮播->700 
   *  金刚区->800
   *  小图商品->900
   *  大图商品区->1000
   *  竖排=>1100
   */
  editContent = (contentType) => {
    this.setState({
      contentType
    })
    fetchPart(contentType).then(res => {
      if (res) {
        this.setState({
          detailModule: res
        })
      }
    })
  }
  /**
   * type: 无标题轮播->700
   *  金刚区->800
   *  小图商品->900
   *  大图商品区->1000
   *  竖排=>1100
   */
  renderModule = () => {
    const { contentType, detailModule, moduleList } = this.state;
    let moduleContent;
    if (contentType == 700) {
      moduleContent = <TitleCarousel moduleItem={moduleList[contentType]} detail={detailModule} afterSave={() => { this.resetData() }}></TitleCarousel>
    } else if (contentType == 800) {
      moduleContent = <Variant moduleItem={moduleList[contentType]} detail={detailModule} afterSave={() => { this.resetData() }}></Variant>
    } else if (contentType == 900 || contentType == 1000 || contentType == 1100) {
      moduleContent = <TitleGoods moduleItem={moduleList[contentType]} detail={detailModule} afterSave={() => { this.resetData() }}></TitleGoods>
    }
    return moduleContent
  }
  getCarousel = (itemList) => {
    return itemList.map(item => {
      return <img key={item.id} src={item.url} />
    })
  }
  changeModule = (moduleItem,e)=>{
    e.stopPropagation();
    let status = moduleItem.status == 1 ? 0 : 1
    delModules({ id: moduleItem.id, status }).then(res => {
      if (res) {
        this.props.dispatch({
          type: 'mall/fetchModules',
          payload: {}
        })
      }
    })
  }

  render() {
    const { contentType, moduleList } = this.state;
    const { loading } = this.props;
    let moduleArray = []
    if (!moduleList['700']) {
      return <PageHeader title="电商首页"></PageHeader>
    }
    for (let moduleMap in moduleList) {
      moduleArray.push(moduleList[moduleMap])
    }
    return (
      <PageHeader title="电商首页">
        <Spin spinning={loading}>
          <div className={Styles.setting}>
            <div className={Styles.phoneIndex}>
              <div className={Styles.nav}>
                <li>推荐</li>
                <li>分类</li>
                <li>分类</li>
                <li>分类</li>
                <li>分类</li>
              </div>
              {
                moduleList['700'].status == 1 && <div className={`${Styles.carousel} ${contentType == '700' ? Styles.active : ''} ${moduleList['700'].itemList.length == 0 ? Styles.placehold : ''}`} onClick={() => { this.editContent('700') }}>
                  <Carousel autoplay>
                    {this.getCarousel(moduleList['700'].itemList)}
                  </Carousel>
                  <Icon className={Styles.mclose} type="close-circle" onClick={(e) => { this.changeModule(moduleList['700'], e) }} />
                </div>
              }

              {
                moduleList['800'].status == 1 && <div className={`${Styles.variant} ${contentType == '800' ? Styles.active : ''} ${moduleList['800'].itemList.length == 0 ? Styles.placehold : ''}`} onClick={() => { this.editContent('800') }}>
                  {
                    moduleList['800'].itemList.map(item => {
                      return (
                        <div key={item.id} className={Styles.item}>
                          <img src={item.url} />
                          <span className={Styles.name}>{item.groupName}</span>
                        </div>
                      )
                    })
                  }
                  <Icon className={Styles.mclose} type="close-circle" onClick={(e) => { this.changeModule(moduleList['800'], e) }} />
                </div>
              }
              {
                moduleList['900'].status == 1 && <>
                  <div className={Styles.nav}>
                    <li>{moduleList['900'].name}</li>
                    <li>更多<Icon type="right" /></li>
                    <Icon className={Styles.mclose} type="close-circle" onClick={(e) => { this.changeModule(moduleList['900'], e) }} style={{ top: '10px', color: '#595959', zIndex: '1' }} />
                  </div>
                  <div className={`${Styles.goodsContainer} ${contentType == '900' ? Styles.active : ''} ${moduleList['900'].itemList.length == 0 ? Styles.placehold : ''}`} onClick={() => { this.editContent('900') }}>
                    <div className={Styles.goods} style={{ width: 140 * moduleList['900'].itemList.length }}>
                      {
                        moduleList['900'].itemList.map(moduleItem => {
                          return (
                            <div key={moduleItem.id} className={`${Styles.small} ${Styles.good}`}>
                              <div className={Styles.mainImg}>
                                <img src={moduleItem.pic} />
                              </div>
                              <p className={Styles.title}>{moduleItem.name}</p>
                              <p className={Styles.des}>{moduleItem.description}</p>
                              <p className={Styles.price}>{`￥${moduleItem.price}`}</p>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </>
              }
              {
                moduleList['1000'].status == 1 && <>
                  <div className={Styles.nav}>
                    <li>{moduleList['1000'].name}</li>
                    <li>更多<Icon type="right" /></li>
                    <Icon className={Styles.mclose} type="close-circle" onClick={(e) => { this.changeModule(moduleList['1000'], e) }} style={{ top: '10px', color: '#595959', zIndex: '1' }} />
                  </div>
                  <div className={`${Styles.goodsContainer} ${contentType == '1000' ? Styles.active : ''} ${moduleList['1000'].itemList.length == 0 ? Styles.placehold : ''}`} onClick={() => { this.editContent('1000') }}>
                    <div className={Styles.goods} style={{ width: 230 * moduleList['1000'].itemList.length }}>
                      {
                        moduleList['1000'].itemList.map(moduleItem => {
                          return (
                            <div key={moduleItem.id} className={Styles.good}>
                              <div className={Styles.mainImg}>
                                <img src={moduleItem.pic} />
                              </div>
                              <p className={Styles.title}>{moduleItem.name}</p>
                              <p className={Styles.des}>{moduleItem.description}</p>
                              <p className={Styles.price}>{`￥${moduleItem.price}`}</p>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </>
              }

              {
                moduleList['1100'].status == 1 && <>
                  <div className={Styles.nav}>
                    <li>{moduleList['1100'].name}</li>
                    <li>更多<Icon type="right" /></li>
                  </div>
                  <div className={`${Styles.symmetryContainer} ${contentType == '1100' ? Styles.active : ''} ${moduleList['1100'].itemList.length == 0 ? Styles.placehold : ''}`} onClick={() => { this.editContent('1100') }}>
                    <div className={Styles.goods}>
                      {
                        moduleList['1100'].itemList.map(moduleItem => {
                          return (
                            <div key={moduleItem.id} className={Styles.good}>
                              <div className={Styles.mainImg}>
                                <img src={moduleItem.pic} />
                              </div>
                              <p className={Styles.title}>{moduleItem.name}</p>
                              <p className={Styles.des}>{moduleItem.description}</p>
                              <p className={Styles.price}>{`￥${moduleItem.price}`}</p>
                            </div>
                          )
                        })
                      }
                    </div>
                    <Icon className={Styles.mclose} type="close-circle" onClick={(e) => { this.changeModule(moduleList['1100'], e) }} />
                  </div>
                </>
              }
            </div>
            <div>
              <div className={Styles.module}>
                {moduleArray.map(item => (
                  <Button disabled={item.status == 1} key={item.id} type="primary" className={Styles.btn}
                    onClick={(e) => { this.changeModule(item, e) }}>{item.typeName}</Button>))}
              </div>
              {contentType && <div className={Styles.edit}>
                <p className={Styles.title}>编辑内容</p>
                {this.renderModule()}
              </div>}
            </div>
          </div>
        </Spin>
      </PageHeader>
    );
  }
}
