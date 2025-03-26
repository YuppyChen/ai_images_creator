HTTP调用接口
功能描述
接口层面采用了异步调用的方式进行任务提交，在通过任务接口提交作业之后，系统会返回对应的作业ID，随后客户可以通过对应的异步作业查询接口获取任务的状态并且在作业到达最终完成态后取回对应的作业结果。

前提条件
已开通服务并获得API-KEY：获取API Key、配置API Key到环境变量。

作业提交接口调用
 
POST https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis
入参描述






传参方式

字段

类型

必选

描述

示例值

Header

Content-Type

String

是

请求类型：application/json。

application/json

Authorization

String

是

API-Key，例如：Bearer d1**2a。

Bearer d1**2a

X-DashScope-Async

String

是

固定使用enable，表明使用异步方式提交作业。

enable

Body

model

String

是

指明需要调用的模型，目前只支持flux-schnell。

flux-schnell

input.prompt

String

是

文本内容，支持中英文，中文不超过 500 个字符，英文不超过 500 个单词，超过部分会自动截断。

一只奔跑的加菲猫

parameters.size

String

否

生成图像的分辨率，目前支持"512*1024, 768*512, 768*1024, 1024*576, 576*1024, 1024*1024"六种分辨率，默认为1024*1024像素。

512*1024

parameters.seed

Integer

否

图片生成时候的种子值，如果不提供，则算法自动用一个随机生成的数字作为种子，如果给定了，则根据 batch 数量分别生成 seed，seed+1，seed+2，seed+3为参数的图片。

42

parameters.steps

Integer

否

图片生成的推理步数，如果不提供，则默认为30，如果给定了，则根据 steps 数量生成图片。flux-schnell 模型官方默认 steps 为4，flux-dev 模型官方默认 steps 为50。

5

parameters.guidance

Float

否

指导度量值，用于在图像生成过程中调整模型的创造性与文本指导的紧密度。较高的值会使得生成的图像更忠于文本提示，但可能减少多样性；较低的值则允许更多创造性，增加图像变化。默认值为3.5。

1.7

parameters.offload

Boolean

否

一个布尔值，表示是否在采样过程中将部分计算密集型组件临时从GPU卸载到CPU，以减轻内存压力或提升效率。如果您的系统资源有限或希望加速采样过程，可以启用此选项，默认为False。

True

parameters.add_sampling_metadata

Boolean

否

一个布尔值，决定是否在输出的图像文件中嵌入生成时使用的提示文本等元数据信息。这对于后续跟踪或分享生成设置非常有用，默认为True。

False

出参描述




字段

类型

描述

示例值

output.task_id

String

本次请求的异步任务的作业id，实际作业结果需要通过异步任务查询接口获取。

13b1848b-5493-4c0e-8c44-68d038b492af

output.task_status

String

提交异步任务后的作业状态。

PENDING

request_id

String

本次请求的系统唯一码。

7574ee8f-38a3-4b1e-9280-11c33ab46e51

请求示例
以下示例展示通过CURL命令来调用FLUX模型的脚本。

说明
需要使用您的API-KEY替换示例中的YOUR-DASHSCOPE-API-KEY，代码才能正常运行。

 
curl --location 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis' \
--header 'X-DashScope-Async: enable' \
--header 'Authorization: Bearer <YOUR-DASHSCOPE-API-KEY>' \
--header 'Content-Type: application/json' \
--data '{
    "model": "flux-schnell",
    "input": {
        "prompt": "奔跑小猫"
    },
    "parameters": {
        "size": "1024*1024",
        "seed":42,
        "steps":4
    }
}'
响应示例
 
{
    "output": {
        "task_id": "13b1848b-5493-4c0e-8c44-68d038b492af", 
    	"task_status": "PENDING"
    }
    "request_id": "7574ee8f-38a3-4b1e-9280-11c33ab46e51"
}
异常响应示例
在提交作业请求出错的情况下，输出的结果中会通过code和message指明出错原因。

 
{
    "code":"InvalidApiKey",
    "message":"Invalid API-key provided.",
    "request_id":"fb53c4ec-1c12-4fc4-a580-cdb7c3261fc1"
}
作业任务状态查询和结果获取接口
 
GET https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}
入参描述






传参方式

字段

类型

必选

描述

示例值

Url Path

task_id

String

是

需要查询作业的task_id。

13b1848b-5493-4c0e-8c44-68d038b492af

Header

Authorization

String

是

API-Key，例如：Bearer d1**2a。

Bearer d1**2a

出参描述




字段

类型

描述

示例值

output.task_id

String

本次请求的异步任务的作业id，实际作业结果需要通过异步任务查询接口获取。

13b1848b-5493-4c0e-8c44-68d038b492af

output.task_status

String

被查询作业的作业状态。

任务状态：

PENDING：排队中

RUNNING：处理中

SUCCEEDED：成功

FAILED：失败

UNKNOWN： 作业不存在或状态未知

usage.task_metrics

Object

作业中每个batch任务的状态（当前默认总batch数目等于1）：

TOTAL：总batch数目

SUCCEEDED：已经成功的batch数目

FAILED：已经失败的batch数目

"task_metrics":{

 "TOTAL":1,

 "SUCCEEDED":1,

 "FAILED":1

}

usage.image_count

Integer

本次请求成功生成的图片数量。

1

request_id

String

本次请求的系统唯一码。

7574ee8f-38a3-4b1e-9280-11c33ab46e51

请求示例
以下示例展示通过CURL命令来调用FLUX模型的脚本。

说明
需要使用您的API-KEY替换示例中的YOUR-DASHSCOPE-API-KEY，代码才能正常运行。

 
curl -X GET \
--header 'Authorization: Bearer <YOUR-DASHSCOPE-API-KEY>' \
https://dashscope.aliyuncs.com/api/v1/tasks/86ecf553-d340-4e21-af6e-a0c6a421c010
响应示例（作业执行中）
作业提交后将处于排队状态，在得到调度之后将转为运行状态，此时作业的状态为RUNNING，task_metrics将给出具体batch状态；

 
{
    "request_id":"e5d70b02-ebd3-98ce-9fe8-759d7d7b107d",
    "output":{
        "task_id":"86ecf553-d340-4e21-af6e-a0c6a421c010",
        "task_status":"RUNNING",
        "task_metrics":{
            "TOTAL":1,
            "SUCCEEDED":1,
            "FAILED":0
        }
    }
}
响应示例（作业成功执行完毕）
如果作业执行完成并成功之后，再次查询作业状态，接口将在告知作业状态的同时，一并将作业的结果返回。对于FLUX，作业在结束之后的状态会持续保留24小时以备客户随时查询，24小时之后，作业将从系统中清除，相关的结果也将一并清除；对应的，作业生成结果为图像的URL地址，出于安全考虑，该URL的下载有效期也是24小时，需要用户在获取作业结果后根据需要及时使用或者转存。

 
{
    "request_id":"85eaba38-0185-99d7-8d16-4d9135238846",
    "output":{
        "task_id":"86ecf553-d340-4e21-af6e-a0c6a421c010",
        "task_status":"SUCCEEDED",
        "results":[
            {
                "url":"https://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/123/a1.png"
            }
        ],
        "task_metrics":{
            "TOTAL":1,
            "SUCCEEDED":1,
            "FAILED":0
        }
    },
    "usage":{
        "image_count":2
    }
}
响应示例（作业失败）
如果因为某种原因作业失败，则作业状态会设置为FAILED，并且通过code和message字段指明错误原因。

 
{
    "request_id":"e5d70b02-ebd3-98ce-9fe8-759d7d7b107d",
    "output":{
        "task_id":"86ecf553-d340-4e21-af6e-a0c6a421c010",
        "task_status":"FAILED",
        "code":"InvalidParameter",
	"message":"The size is not match the allowed size ['1024*1024', '720*1280', '1280*720']",
        "task_metrics":{
            "TOTAL":1,
            "SUCCEEDED":0,
            "FAILED":1
        }
    }
}
错误码
如果模型调用失败并返回报错信息，请参见错误码进行解决。