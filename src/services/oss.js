import request from '@/utils/request';
import API from '@/utils/api';
import moment from 'moment';
import Helper from '@/utils/helper'
import { message } from 'antd';

export function fetchOSSPolicy(fileName){
    let suffix = fileName.split('.')[1];
    fileName = `${+moment()}_${fileName}`;
    console.log(fileName,'oss')
    if (Helper.checkSpecialStr(fileName)) {
        return new Promise((resolve,reject)=>{
            message.error('上传文件名不能含有特殊字符！');
            reject('上传文件名不能含有特殊字符！');
        })
    }
    return request(API.ALIYUN_OSS_POLICY).then(data=>{
        if(data){
            return {
                host: data.host,
                ossData: {
                    'key': `${data.dir}/${fileName}`,
                    'policy': data.policy,
                    'OSSAccessKeyId': data.accessKeyId,
                    'signature': data.signature,
                }
            }
        }
    })
}