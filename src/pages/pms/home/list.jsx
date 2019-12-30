import React, { Component } from 'react';
import config from '@/config';
import { connect } from 'dva'
import { PageHeader, Carousel, Icon, Button, Spin } from 'antd';
import TitleCarousel from './components/titleCarousel'
import RankSetting from './components/rankSetting'
import { fetchPart, fetchAllCourse, delModules } from '@/services/courseHome'
import Styles from './style.less'
import TitleGoods from './components/titleGoods';
import Variant from './components/Variant';

@connect(({ courseHome, loading }) => ({
  moduleList: courseHome.moduleList,
  loading: loading.models.courseHome
}))
/**
 * @author bj
 */
export default class HomePage extends Component {

  state = {
    contentType: '',
    detailModule: [],
    saveData: [],
    moduleList: {},
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.moduleList != nextProps.moduleList) {
      this.setState({ moduleList: nextProps.moduleList })
    }
  }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'courseHome/fetchModules',
      payload: {}
    })
    dispatch({
      type: 'courseHome/fetchAllCourse',
      payload: {}
    })
    dispatch({
      type: 'courseHome/fetchAllRank',
      payload: { type: 11 }
    })
    dispatch({
      type: 'courseHome/fetchAllGroup',
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
   * type: 无标题轮播->200 
   * 带标题排行版->300 
   * 带标题轮播->400
   *  带标题商品区->500
   * 金刚区->1200
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
   * 无标题轮播->200
   * 带标题排行版->300
   * 带标题轮播->400
   * 带标题商品区->500
   * 金刚区->1200
   */
  renderModule = () => {
    const { contentType, detailModule, moduleList } = this.state;
    let moduleContent;
    if (contentType == 200) {
      moduleContent = <TitleCarousel moduleItem={moduleList[contentType]} detail={detailModule} afterSave={() => { this.resetData() }}></TitleCarousel>
    } else if (contentType == 300) {
      moduleContent = <RankSetting moduleItem={moduleList[contentType]} detail={detailModule} afterSave={() => { this.resetData() }}></RankSetting>
    } else if (contentType == 400) {
      moduleContent = <TitleCarousel moduleItem={moduleList[contentType]} detail={detailModule} afterSave={() => { this.resetData() }}></TitleCarousel>
    } else if (contentType == 500) {
      console.log(moduleList)
      moduleContent = <TitleGoods moduleItem={moduleList[contentType]} detail={detailModule} afterSave={() => { this.resetData() }}></TitleGoods>
    } else if (contentType == 1200) {
      moduleContent = <Variant moduleItem={moduleList[contentType]} detail={detailModule} afterSave={() => { this.resetData() }}></Variant>
    }
    return moduleContent
  }
  getCarousel = (itemList) => {
    return itemList.map(item => {
      return <img key={item.id} src={item.url} />
    })
  }
  changeModule = (moduleItem, e) => {
    e.stopPropagation();
    let status = moduleItem.status == 1 ? 0 : 1
    delModules({ id: moduleItem.id, status }).then(res => {
      if (res) {
        this.props.dispatch({
          type: 'courseHome/fetchModules',
          payload: {}
        })
      }
    })
  }
  render() {
    const { contentType, moduleList } = this.state;
    const { loading } = this.props;
    let moduleArray = []
    if (!moduleList['200']) {
      return <PageHeader title="首页设置"></PageHeader>
    }
    for (let moduleMap in moduleList) {
      moduleArray.push(moduleList[moduleMap])
    }
    return (
      <PageHeader title="首页设置">
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
                moduleList['200'].status == 1 && <div className={`${Styles.carousel} ${contentType == '200' ? Styles.active : ''} ${moduleList['200'].itemList.length == 0 ? Styles.placehold : ''}`} onClick={() => { this.editContent('200') }}>
                  <Carousel autoplay>
                    {this.getCarousel(moduleList['200'].itemList)}
                  </Carousel>
                  <Icon className={Styles.mclose} type="close-circle" onClick={(e) => { this.changeModule(moduleList['200'], e) }} />
                </div>
              }
              {moduleList['1200'].status == 1 && <div className={`${Styles.variant} ${contentType == '1200' ? Styles.active : ''} ${moduleList['1200'].itemList.length == 0 ? Styles.placehold : ''}`} onClick={() => { this.editContent('1200') }}>
                {
                  moduleList['1200'].itemList.map(item => {
                    return (
                      <div key={item.id} className={Styles.item}>
                        <img src={item.url} />
                        <span className={Styles.name}>{item.groupName}</span>
                      </div>
                    )
                  })
                }
                <Icon className={Styles.mclose} type="close-circle" onClick={(e) => { this.changeModule(moduleList['1200'], e) }} />
              </div>}
              {
                moduleList['300'].status == 1 && <>
                  <div className={Styles.nav}>
                    <li>{moduleList['300'].name}</li>
                    <li className={Styles.more}>更多<Icon type="right" /></li>
                  </div>
                  <div className={`${Styles.cards} ${contentType == '300' ? Styles.active : ''} ${moduleList['300'].itemList.length == 0 ? Styles.placehold : ''}`} onClick={() => { this.editContent('300') }}>
                    {moduleList['300'].itemList.map(moduleItem => {
                      return (
                        <div className={Styles.cardImg} key={moduleItem.id}>
                          <img src={moduleItem.courseCover} />
                        </div>)
                    })
                    }
                    <Icon className={Styles.mclose} type="close-circle" onClick={(e) => { this.changeModule(moduleList['300'], e) }} />
                  </div>
                </>
              }
              {
                moduleList['400'].status == 1 && <>
                  <div className={Styles.nav}>
                    <li>{moduleList['400'].name}</li>
                  </div>
                  <div className={`${Styles.carousel} ${contentType == '400' ? Styles.active : ''} ${moduleList['400'].itemList.length == 0 ? Styles.placehold : ''}`} onClick={() => { this.editContent('400') }}>
                    <Carousel autoplay>
                      {this.getCarousel(moduleList['400'].itemList)}
                    </Carousel>
                    <Icon className={Styles.mclose} type="close-circle" onClick={(e) => { this.changeModule(moduleList['400'], e) }} />
                  </div>
                </>
              }
              {
                moduleList['500'].status == 1 && <>
                  <div className={Styles.nav}>
                    <li>{moduleList['500'].name}</li>
                    <li>更多<Icon type="right" /></li>
                    <Icon className={Styles.mclose} type="close-circle" onClick={(e) => { this.changeModule(moduleList['500'], e) }} style={{ top: '10px', color: '#595959', zIndex: '1' }} />
                  </div>
                  <div className={`${Styles.goodsContainer} ${contentType == '500' ? Styles.active : ''} ${moduleList['500'].itemList.length == 0 ? Styles.placehold : ''}`} onClick={() => { this.editContent('500') }}>
                    <div className={Styles.goods} style={{ width: 230 * moduleList['500'].itemList.length }}>
                      {
                        moduleList['500'].itemList.map(moduleItem => {
                          return (
                            <div key={moduleItem.id} className={Styles.good}>
                              <div className={Styles.mainImg}>
                                <img src={moduleItem.courseCover} />
                              </div>
                              <p className={Styles.title}>{moduleItem.courseName}</p>
                              <p className={Styles.des}>{moduleItem.courseDescribe}</p>
                              <p className={Styles.price}>{`￥${moduleItem.coursePrice}`}</p>
                            </div>
                          )
                        })
                      }
                    </div>
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
