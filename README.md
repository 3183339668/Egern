name: 吾爱破解自动签到
description: 自动签到与Cookie获取 (支持界面化参数配置与自定义任务时间)
author: ZenMoFeiShi
icon: https://raw.githubusercontent.com/Yuheng0101/X/main/Assets/52pojie.png
compat_arguments:
  enableCookie: 'true'
  enableCheckin: 'true'
  cron: '20 8,20 * * *'
  timeout: '60'
compat_arguments_schema:
  enableCookie:
    name: 开启Cookie获取
    description: 开启后请打开App触发请求，成功后建议关闭以节省资源
    default_value: 'true'
    options: ['true', 'false']
  enableCheckin:
    name: 开启定时签到
    description: 是否运行自动签到任务
    default_value: 'true'
    options: ['true', 'false']
  cron:
    name: 自定义签到时间 (Cron)
    description: 修改后请重载模块生效，格式：分 时 天 月 周
    default_value: '20 8,20 * * *'
  timeout:
    name: 超时时间 (秒)
    description: 请求超时限制
    default_value: '60'
scriptings:
  - http_request:
      name: 吾爱获取Cookie
      match: ^https:\/\/api\.wetalkapp\.com\/app\/
      script_url: https://raw.githubusercontent.com/ZenmoFeiShi/Qx/main/WeTalk.js
      body_required: false
      env:
        _compat.$argument: '{"enableCookie":true,"enableCheckin":true,"cron":"20 8,20 * * *","timeout":60}'
  - schedule:
      name: 吾爱定时签到
      cron: 20 8,20 * * *
      script_url: https://raw.githubusercontent.com/ZenmoFeiShi/Qx/main/WeTalk.js
      timeout: 60
      env:
        _compat.$argument: '{"enableCookie":true,"enableCheckin":true,"cron":"20 8,20 * * *","timeout":60}'
mitm:
  hostnames:
    includes:
      - api.wetalkapp.com
