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
				"volume": "", // 持有股数
				"marketCapital": "", // 市值
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
		"price": 0.00, // 现价
		"percentage": 0.00, // 现价/昨收偏离率
		"priceOpen": 0.00, // 今日开盘价格
		"priceLastClose": 0.00, // 昨日收盘价格
		"priceTodayMax": 0.00, // 盘中最高价
		"priceTodayMin": 0.00, // 盘中最低价
		"priceRiseStop": 0.00, // 涨停价
		"priceFallStop": 0.00, // 跌停价
		"amount": 0.00, // 成交额
		"volume": 0, // 成交股数
		"quoteQueue":{
			"buy":[
				{
					"price":0.00, // 申报买入价
					"volume":0 // 申报买入股数
				}
			],
			"sell":[
				{
					"price":0.00,
					"volume":0
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
		"name":"", // 篮子名称
		"stocks":[
			{
				"id": "",
				"weight": 0, // 权重
			}
		]
	}

任务(task)
------------------------------------

	{
		"timeStart": "2015-07-08T01:30:00.000Z",
		"timeEnd": "2015-07-08T07:00:00.000Z",
		"status": "not started|in progress|paused|completed|canceled",
		"progress": 1.00, // 进度, 0-1
		"stocks":[
			{
				"id": "", 
				"direction": true, // true: 买入, false: 卖出
				"rules": {
					"lowestPrice": 0.00, // 最低价格
					"highestPrice": 0.00, // 最高价格
					"timeStep": 0, // 最小交易时间间隔
				},
				// 以下四项总量计算方式任选其一
				"targetRatio": 0.00, // 目标持仓比例
				"ratio": 0.00, // 本次交易比例
				"volume": 0, // 本次交易股数
				"volume": 0.00, // 本次交易金额
				// 账户任务明细
				"accounts":[
					{
						"id": "", // 账户ID
						"name": "", // 账户名称
						"volume": "", // 本任务本账户交易股数
						"volumeCompleted": "", // 已成交股数
						"volumeDeclared": "", // 已申报未成交股数
						"volumeTodo": "", // 待成交股数
						"declarations": [ // 申报列表
							{
								"stock_id": "",
								"serialNumber":"", // 通道流水号/合同号
								"direction": true,
								"price": 0.00,
								"time": "2015-07-08T01:30:00.000Z",
								"volume": 0,
								"volumeCompleted": 0,
								"status": "not declared|declared|completed|partial completed"
							}
						],
						"transactions":[ // 成交记录
							{
								"stock_id": "",
								"serialNumber":"", // 通道流水号/合同号
								"direction": true,
								"price": 0.00,
								"time": "2015-07-08T01:30:00.000Z",
								"volume": 0,
								"amount": 0.00
							}
						]
					}
				]
			}
		]
	}
