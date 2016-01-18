术语定义
====================================

`amount` 货币金额

`volume` 股数

`ratio` 比例, 如1, 0.8

`percentage` 百分数, 如100, 50


数据结构
====================================

账户/产品(account)
------------------------------------

	{
		"id": "",
		"name": "",
		"type": "", // 账户类型 public:产品/private:个人账户
		"provider": {
			"name": "", // 通道提供商名称
			"code": "" // 通道提供商代号
		},
		"credentials": {
			"login": "", // 登录帐号
			"pass": "" // 密码
		},
		"stocks": [ // 持有证券
			{
				"id": "", // stock.id
				"name":"",
				"code":"",
				"volume": "", // 持有股数, 融券时为负数
				"marketCapital": "", // 市值, 融券时为负数
				"cost": 0.00, // 成本价格
				"profit": 0.00, // 浮动盈亏
				"profitRatio": 0.00 // 浮动盈亏比例
			}
		],
		"cash": [ // 资金
			{
				"currency": "CNY", // 币种
				"amount": 0.00 //数额
			}
		]
	}

股票/债券/期货/基金/指数(stock)
------------------------------------

	{
		"id": "",
		"type": "stock|bond|future|option|index",
		"name": "", // 标的的显示名称
		"code": "", // 标的的代号
		"currency": "CNY", // 币种，仅针对有价证券
		"current": 0.00, // 现价
		"time": "2015-07-08T01:30:00.000Z", // 现价更新时间
		"percentage": 0.00, // 现价/昨收偏离率
		"offset": 0.00, // 现价/昨收偏离
		"open": 0.00, // 今日开盘价格
		"lastClose": 0.00, // 昨日收盘价格
		"todayMax": 0.00, // 盘中最高价
		"todayMin": 0.00, // 盘中最低价
		"riseStop": 0.00, // 涨停价
		"fallStop": 0.00, // 跌停价
		"amount": 0.00, // 成交额
		"volume": 0, // 成交股数
		"quoteQueue": {
			"buy": [
				{
					"price": 0.00, // 申报买入价
					"volume": 0 // 申报买入股数
				}
			],
			"sell": [
				{
					"price": 0.00,
					"volume": 0
				}
			]
		},
		"pb": 1.00, // 市净率
		"peLyr": 1.00, // 上年度市盈率
		"peTtm": 1.00, // 本季度市盈率
		"psr": 1.00, // 市销率
		"totalShares": 0E0, // 总手数
		"floatShares": 0E0, // 流通手数
		"marketCapital": 0E0, // 总市值
		"floatMarketCapital": 0E0, // 流通市值
		"netAssets": 0.00, // 每股净资产
		"tickSize": 0.01, // 最小价格单位
		"lotSize": 100, // 每手股数
		"industry": [], // 行业
		"concept": [] // 概念
	}

投资标的篮子(bucket)
------------------------------------

	{
		"name": "", // 篮子名称
		"stocks": [
			{
				"id": "",
				"weight": 0 // 权重
			}
		]
	}

任务(task)
------------------------------------

// 带\*的为创建时必填, 带\*\*的为创建时选填, 注意有些选填至少多选一, 或在有些情况下为必填

	{
		"id": "",
		"type": "", // * normal: 普通交易任务, diff: 差价交易任务
		"timeStart": "2015-07-08T01:30:00.000Z", // **
		"timeEnd": "2015-07-08T07:00:00.000Z", // **
		"status": "not started|in progress|paused|completed|canceled",
		"progress": 1.00, // 进度, 0-1,
		"account": ["", ""], // * 参与任务的账户ID, 仅创建时使用, 创建后会经过计算列入stocks每项中
		"direction": true, // * 任务的买卖方向，仅创建时使用，创建后会卖出以负数的金额和股数表示
		"stocks": [
			{
				"id": "",  // *
				"name": "",
				"code": "",
				"rules": {

					"lowestPrice": 0.00, // ** 最低价格
					"highestPrice": 0.00, // ** 最高价格
					"timeStep": 0, // ** 最小交易时间间隔

					"priceDiffPercentage": 0.00, // ** 最大委差 0%-100%
					"opponentLevels": 0, // ** 对收盘档数 1-10
					"opponentRatio": 1.0, // ** 对收盘比例 0-1

					"backtrackFromDate": "2016-01-15", // ** 差价交易的回溯起始日期
					"backtrackToDate": "2016-01-18", // ** 差价交易的回溯终止日期
					"priceDiffPercentage": 0.00 // ** 差价交易的差价百分比
				},
				// 以下四项总量计算方式任选其一, 至少填一项
				"targetRatio": 0.00, // ** 目标持仓比例
				"ratio": 0.00, // ** 本次交易比例
				"volume": 0, // ** 本次交易股数, 正数买入, 负数卖出
				"amount": 0.00, // ** 本次交易金额, 正数买入, 负数卖出

				"volumeCompleted": 0, // 已成交股数, 正数买入, 负数卖出
				"volumeDeclared": 0, // 已申报未成交股数, 正数买入, 负数卖出
				"volumeTodo": 0, // 待成交股数, 正数买入, 负数卖出

				// 账户任务明细
				"accounts": [
					{
						"id": "", // 账户ID
						"name": "", // 账户名称
						"rules": {
							"lowestPrice": 0.00, // 最低价格 >0
							"highestPrice": 0.00, // 最高价格 >0
							"timeStep": 0, // 最小交易时间间隔
							"priceDiffPercentage": 0.00, // 最大委差 0%-100%
							"opponentLevels": 0, // 对收盘档数 1-10
							"opponentRatio": 1.0 // 对收盘比例 0-1
						},
						"volume": 0, // 本任务本账户交易股数, 正数买入, 负数卖出
						"volumeCompleted": 0, // 已成交股数, 正数买入, 负数卖出
						"volumeDeclared": 0, // 已申报未成交股数, 正数买入, 负数卖出
						"volumeTodo": 0, // 待成交股数, 正数买入, 负数卖出
						"declarations": [ // 申报列表
							{
								"type": "", // 挂单类型
								"serialNumber": "", // 通道流水号/合同号
								"price": 0.00,
								"time": "2015-07-08T01:30:00.000Z",
								"volume": 0, // 正数买入, 负数卖出
								"amount": 0.00, // 正数买入, 负数卖出
								"volumeCompleted": 0, // 正数买入, 负数卖出
								"status": "not declared|declared|completed|partial completed"
							}
						],
						"transactions": [ // 成交记录
							{
								"serialNumber": "", // 通道流水号/合同号
								"price": 0.00,
								"time": "2015-07-08T01:30:00.000Z",
								"volume": 0, // 正数买入, 负数卖出
								"amount": 0.00 // 正数买入, 负数卖出
							}
						]
					}
				]
			}
		]
	}

用户(user)
------------------------------------
	
	{
		"name":"",
		"password":"",
		"email":"",
		"mobile":"",
		"roles":[]
	}

配置(config)
------------------------------------
	
	{
		"key":"",
		"value":""
	}

交易接口
====================================

*交易接口服务和量化服务建立Socket通信，每次传输一个JSON字符串，表示一个账户下的报/撤单请求或成交/撤单结果，格式同task.stocks[].accounts[]*

	{
		"id": "",
		"name": "",
		"provider": {
			"name": "", // 通道提供商名称
			"code": "" // 通道提供商代号
		},
		"credentials": {
			"login": "", // 登录帐号
			"pass": "" // 密码
		},
		"declarations": [ // 量化服务向交易接口服务发送的报单/撤单后的所有申报，交易接口服务向量化服务发送的报单/撤单/成交后的所有申报
			{
				"id":"",
				"stock": {
					"id": "",
					"type": "",
					"name": "", // 标的的显示名称
					"code": "", // 标的的代号
				},
				"type":"", // 挂单类型
				"serialNumber":"", // 通道流水号/合同号
				"price": 0.00,
				"time": "2015-07-08T01:30:00.000Z",
				"volume": 0, // 正数买入, 负数卖出
				"volumeCompleted": 0, // 正数买入, 负数卖出
				"status": "not declared|declared|completed|partial completed"
			}
		],
		"transactions":[ // 交易接口服务向量化服务发送的一次成交数据
			{
				"id":"",
				"stock": {
					"id": "",
					"type": "",
					"name": "", // 标的的显示名称
					"code": "", // 标的的代号
				},
				"serialNumber":"", // 通道流水号/合同号
				"price": 0.00,
				"time": "2015-07-08T01:30:00.000Z",
				"volume": 0, // 正数买入, 负数卖出
				"amount": 0.00 // 正数买入, 负数卖出
			}
		]
	}
