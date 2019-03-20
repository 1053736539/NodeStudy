<template>
  <div class="platform_html">
    <div class="platform_head">
      <div class="_left">
        <div class="_text">首页</div>
      </div>
      <div class="_middle">
        <div class="cn">数据监测大屏项目标题</div>
        <div class="en">Internet Data Debt Distribution Map</div>
      </div>
      <div class="_right">2019-02-13 12:00:00</div>
    </div>


    <div class="platform_body">

      <div class="_left_slide">
        <div class="data-box w_1360">
          <div class="_title_box">
            <div class="_decorate"></div>
            <div class="_t" style="text-align: center">监控大屏</div>
          </div>
          <div class="_box">
              内容区
          </div>
        </div>

        <!--四个百分比区-->
        <div class="percent_data_box">
          <div class="data-box w_325 _item">
            <div class="_title_box _disable">
              <div class="_decorate"></div>
              <div class="_t"></div>
            </div>
            <div class="_box _disable percent_content">
              <div class="_status _normal">正常</div>
              <div class="_pre">噪声:</div>
              <div class="_num">0</div>
              <div class="_num">6</div>
              <div class="_num">8</div>
              <div class="_symbol"></div>
              <div class="_num">1</div>
              <div class="_num">0</div>
              <div class="_num">0</div>
            </div>
          </div>

          <div class="data-box w_325 _item">
            <div class="_title_box _disable">
              <div class="_decorate"></div>
              <div class="_t"></div>
            </div>
            <div class="_box _disable percent_content">
              <div class="_status _warn">警告</div>
              <div class="_pre">空气:</div>
              <div class="_num">0</div>
              <div class="_num">6</div>
              <div class="_num">8</div>
              <div class="_symbol"></div>
              <div class="_num">1</div>
              <div class="_num">0</div>
              <div class="_num">0</div>
            </div>
          </div>

          <div class="data-box w_325 _item">
            <div class="_title_box _disable">
              <div class="_decorate"></div>
              <div class="_t"></div>
            </div>
            <div class="_box _disable percent_content">
              <div class="_status _normal">正常</div>
              <div class="_pre">污水:</div>
              <div class="_num">0</div>
              <div class="_num">6</div>
              <div class="_num">8</div>
              <div class="_symbol"></div>
              <div class="_num">1</div>
              <div class="_num">0</div>
              <div class="_num">0</div>
            </div>
          </div>

          <div class="data-box w_325 _item">
            <div class="_title_box _disable">
              <div class="_decorate"></div>
              <div class="_t"></div>
            </div>
            <div class="_box _disable percent_content">
              <div class="_status _normal">正常</div>
              <div class="_pre">辐射:</div>
              <div class="_num">0</div>
              <div class="_num">6</div>
              <div class="_num">8</div>
              <div class="_symbol"></div>
              <div class="_num">1</div>
              <div class="_num">0</div>
              <div class="_num">0</div>
            </div>
          </div>
        </div>
      </div>

      <div class="_right_slide">
        <div class="data-box w_500">
          <div class="_title_box">
            <div class="_decorate"></div>
            <div class="_t">各区污染源分布</div>
          </div>
          <div class="_box">
            内容区
          </div>
        </div>

        <div class="data-box w_500">
          <div class="_title_box">
            <div class="_decorate"></div>
            <div class="_t">行业分布</div>
          </div>
          <div class="_box">
            内容区
          </div>
        </div>

        <div class="data-box w_500">
          <div class="_title_box">
            <div class="_decorate"></div>
            <div class="_t">噪音预警</div>
          </div>
          <div class="_box">
            内容区
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script>
  export default {
    data(){
      return{

      }
    },
    methods:{

    },
    mounted(){

    }
  }
</script>

<style lang="scss">
  .platform_html{
    position: fixed;
    left: 0;
    bottom: 0;
    top: 0;
    right: 0;
    background: #000f1d;
    overflow: auto;
  }
  .platform_head{
    position: absolute;
    left: 0;
    right: 0;
    height: 100px;
    color:#00fcf9;
    ._left{
      position: absolute;
      left: 15px;
      width: 25%;
      height: 100px;
      &:after,&:before{
        content:"";
        width: 100%;
        height: 1px;
        background: #038bff;
        position: absolute;
      }
      &:before{
        left: 0;
        bottom: 34px;
      }
      &:after{
        left: 3px;
        bottom: 32px;
      }
      ._text{
        width: 120px;
        height: 60px;
        position: absolute;
        left: 0;
        top: 5px;
        /*background: url("../../assets/images/platform_home.png") no-repeat 0 20px;*/
        line-height: 80px;
        text-indent: 36px;
        cursor: pointer;
      }
    }
    ._middle{
      position: absolute;
      left: 20%;
      width: 60%;
      z-index: 1;
      text-align: center;
      height: 100px;
      /*background: url("../../assets/images/platform_title_bg.png") no-repeat center;*/
      .cn{
        font-size: 26px;
        line-height: 1;
        margin-top: 25px;
      }
      .en{
        font-size: 12px;
        line-height: 22px;
      }
    }
    ._right{
      position: absolute;
      right: 15px;
      width: 25%;
      height: 100px;
      /*background: url("../../assets/images/platform_time.png") no-repeat right 145px top 22px;*/
      line-height: 80px;
      font-size: 16px;
      text-align: right;
      &:after,&:before{
        content:"";
        width: 100%;
        height: 1px;
        background: #038bff;
        position: absolute;
      }
      &:before{
        left: 3px;
        bottom: 34px;
      }
      &:after{
        left: 0;
        bottom: 32px;
      }
    }
  }
  .platform_body{
    position: absolute;
    left: 0;
    right: 0;
    bottom: 20px;
    top: 130px;
    color:#fff;
    clear: both;
    ._left_slide{
      min-width: 1360px;
      width: 70%;
      float: left;
      margin-left: 1%;
      margin-right: 1%;
    }
    ._right_slide{
      min-width: 500px;
      width: 26%;
      float: left;
    }
  }

  /*外盒*/
  .data-box{
    position: relative;
    border: 1px solid #038bff;
    ._title_box{
      height: 55px;
      background: #011e47;
      line-height: 55px;
      text-indent: 20px;
      font-size: 18px;
      color: #00fcf9;
      position: relative;
      &:before,&:after{
        content:"";
        width: 18px;
        height: 18px;
        top: 0;
        background: #000d22;
        position: absolute;
        transform-origin: center;
      }
      &:before{
        transform: rotate(45deg) translate(-14px, 0);
        left: 0;
        border-right: 1px solid #038bff;
      }
      &:after{
        transform: rotate(-45deg) translate(14px, 0);
        right: 0;
        border-left: 1px solid #038bff
      }
      ._decorate{
        width: 190px;
        height: 12px;
        background: #000d1d;
        position: absolute;
        left: 50%;
        margin-left: -85px;
        top: -1px;
        border-bottom: 1px solid #038bff;
        &:before,&:after{
          content:"";
          width: 14px;
          height: 15px;
          top: 0;
          background: #011e47;
          position: absolute;
          transform-origin: center;
        }
        &:before{
          transform: rotate(-45deg) translate(-7px, -3px);
          left: 0;
          border-right: 1px solid #038bff;
        }
        &:after{
          transform: rotate(45deg) translate(7px, -2px);
          right: 0;
          border-left: 1px solid #038bff
        }
      }
      ._t{
        &:before{
          content:"";
          width: 180px;
          height: 5px;
          background: #0265bb;
          transform-origin: top center;
          transform: scaleY(-1.3) perspective(5px) rotateX(5deg) translate(10px,-5px);
          position: absolute;
          top: 0;
          left: 50%;
          margin-left: -90px;
        }
      }
      &._disable{
        background: #01152e;
        ._decorate{
          &:after,&:before{
            background: #01152e;
          }
        }
      }
    }
    &.w_1360{
      width: 1360px;
      height: 790px;
      margin-bottom: 20px;
      ._decorate{
        width: 500px;
        margin-left: -250px;
      }
      ._t {
        &:before {
          width: 490px;
          margin-left: -245px;
          transform: scaleY(-1.6) perspective(5px) rotateX(2deg) translate(0,-5px);
        }
      }
    }
    &.w_500{
      width: 500px;
      height: 300px;
      margin-bottom: 20px;
    }
    &.w_325{
      width: 325px;
      height: 130px;
      margin-left: 20px;
      &:first-child{
        margin-left: 0;
      }
    }
    ._box{
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      top: 55px;
      background: #01152e;
      &:before,&:after{
        content:"";
        width: 18px;
        height: 18px;
        bottom: 0;
        background: #000d22;
        position: absolute;
        transform-origin: center;
      }
      &:before{
        transform: rotate(-45deg) translate(-14px, 0);
        left: 0;
        border-right: 1px solid #038bff;
      }
      &:after{
        transform: rotate(45deg) translate(14px, 0);
        right: 0;
        border-left: 1px solid #038bff
      }
      &._disable{
        top: 15px;
      }
    }
  }

  .percent_data_box{
    display: flex;
    justify-content: space-between;
  }

  .percent_content{
    display: flex;
    justify-content: center;
    align-items: center;
    ._status{
      position: absolute;
      width: 80px;
      height: 30px;
      right: 0;
      top: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      transform: rotate(45deg) translate(7px,-26px);
      transform-origin: center;
      &._normal{
        <!--background: url("../../assets/images/status1.png") no-repeat center / cover;-->
      }
      &._warn{
        <!--background: url("../../assets/images/status2.png") no-repeat center / cover;-->
      }
    }
    ._pre{
      font-size: 24px;
    }
    ._num{
      width: 30px;
      height: 40px;
      /*background: url("../../assets/images/percent_num.png") no-repeat center;*/
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 28px;
    }
    ._symbol{
      width: 15px;
      height: 40px;
      /*background: url("../../assets/images/percent_sym.png") no-repeat center;*/
    }
  }
</style>
