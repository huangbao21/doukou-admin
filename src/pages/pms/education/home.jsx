import React from 'react';
import cartImg from '@/assets/cart.png';
import config from '@/config';
import { PageHeader, Radio, DatePicker } from 'antd';
import { G2, Chart, Geom, Axis, Tooltip, Coord, Label, Legend, View, Guide, Shape } from "bizcharts"

const { RangePicker } = DatePicker


const data = [{
  year: "8-1",
  value: 400
},
{
  year: "8-2",
  value: 360
},
{
  year: "8-3",
  value: 750
},
{
  year: "8-4",
  value: 600
},
{
  year: "8-5",
  value: 800
}];
const cols = {
  value: {
    min: 0
  },
  year: {
    range: [0, 1]
  }
};
const Home = props => {
  return (
    <PageHeader title="首页">
      <Radio.Group>
        <Radio.Button value={1}>今日</Radio.Button>
        <Radio.Button value={7}>7日</Radio.Button>
        <Radio.Button value={30}>30日</Radio.Button>
        <Radio.Button value={0}>全部</Radio.Button>
      </Radio.Group>
      <RangePicker style={{ marginLeft: '10px' }}></RangePicker>
      <div style={{marginTop:'10px'}}>
        <h3>学员数</h3>
        <Chart height={400} data={data} scale={cols}>
          <Axis name="year" />
          <Axis name="value" />
          <Tooltip crosshairs={{type:'y'}} />
          <Geom type="line" position="year*value" size={2} />
          <Geom
            type="point"
            position="year*value"
            size={4}
            shape={"circle"}
            style={{
              stroke: "#fff",
              lineWidth: 1
            }}
          />
        </Chart>
      </div>
    </PageHeader>
  );
}

export default Home;
