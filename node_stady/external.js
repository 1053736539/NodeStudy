var str="我今年12岁明年13岁后年14岁可以买1000个糖"
var reg=/(\d+)岁/g;
var result;
while (result=reg.exec(str)){
    console.log(result)
}
