<template>
  <div class="container">
    <div>
      <el-row justify="start">
        <el-select v-model="activeProject" placeholder="Select" @change="loadArticles">
          <el-option v-for="item in typeList" :key="item.code" :label="item.name" :value="item.code" />
        </el-select>
        <el-input v-model="keyword" @keyup.enter.native="loadArticles" style="width: 50%;margin-left: 30px;margin-right: 10px" />
        <el-button type="primary" @click="loadArticles">Search</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">添加</el-button>
      </el-row>
    </div>
    <div class="container-body">
      <div v-for="item in page.articleList">
        <el-row class="article-info">
          <el-col :span="22">
            <div>
              <span class="article-title">{{item.title}}</span>
            </div>
            <div class="article-desc">
              <span>{{item.createTime}}</span>
              <el-tag class="ml-2" type="success">Tag 2</el-tag>
            </div>
          </el-col>
          <el-col :span="2">
            <div class="article-opr">
              <el-button size="small" type="info" icon="el-icon-view" @click="handleView(item)" plain/>
              <el-button size="small" type="warning" icon="el-icon-edit-outline" @click="handleEdit(item)" plain/>
              <el-popconfirm
                  confirm-button-text="Yes"
                  cancel-button-text="No"
                  icon-color="#626AEF"
                  title="Are you sure to delete this?"
                  @confirm="handleDelete(item.id)">
                <template #reference>
                  <el-button size="small" type="danger" icon="el-icon-delete" plain/>
                </template>
              </el-popconfirm>
            </div>
          </el-col>
        </el-row>
      </div>
      <div style="margin-top: 10px">
        <el-pagination background layout="total, prev, pager, next" :current-page.sync="page.pageIndex"
                       :page-size="page.pageSize" :total="page.total" @current-change="loadArticles">
        </el-pagination>
      </div>
    </div>

    <!-- 添加窗口 -->
    <el-dialog :visible.sync="dialogVisible" title="添加">
      <el-form :model="form" style="width: 50%;align-content: center" label-width="80px">
        <el-form-item label="类型">
          <el-select v-model="form.projectId" placeholder="Select">
            <el-option v-for="item in typeList" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.title" clearable />
        </el-form-item>
      </el-form>
      <div style="text-align: center">
        <el-button @click="closeForm">取消</el-button>
        <el-button type="primary" @click="submitData">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {getRequest,postJsonRequest,deleteRequest} from "@/api/api";

export default {
  name: "MindIndex",
  data() {
    return {
      page: {
        pageIndex: 1,
        pageSize: 10,
        total: 0,
        articleList: []
      },
      typeList: [],
      activeProject: '',
      keyword: '',
      dialogVisible: false,
      form: {
        title: '',
        projectId: ''
      },

    }
  },
  mounted() {
    this.loadType();
  },

  methods: {
    loadType() {
      getRequest('/dict-value/findByCode',{codes:"bugType"}).then(res=>{
        res=res.data;
        if(res.code===200){
          this.typeList = res.data.bugType
          this.activeProject = this.typeList[0].code
        }
        this.loadArticles();
      }).catch(()=>{
        this.$message({type: 'error', message: '数据加载失败!'});
      });
    },

    loadArticles() {
      getRequest('/article/page',{
        pageIndex: this.page.pageIndex,
        pageSize: this.page.pageSize,
        pid: this.activeProject,
        keyword: this.keyword
      }).then(res=>{
        res=res.data;
        if(res.code===200){
          this.page.articleList = res.data.content
          this.page.pageIndex = res.data.pageable.pageNumber+1
          this.page.total = res.data.totalElements
        }
      }).catch(()=>{
        this.$message({type: 'error', message: '数据加载失败!'});
      });
    },
    handleAdd() {
      this.dialogVisible = true;
    },
    handleView(item) {
      this.$router.push({name: 'MindMapEdit', query: {articleId: item.id, operateType: 'view'}})

    },
    handleEdit(item) {
      this.$router.push({name: 'MindMapEdit', query: {articleId: item.id, operateType: 'edit'}})
    },
    handleDelete(id) {
      deleteRequest("/article?id="+id).then(res=>{
        if(res.data.code===200){
          this.$message({type: 'success', message: '删除成功!'});
        }
        this.loadArticles()
      })
    },

    closeForm() {
       Object.keys(this.form).forEach(key => {
         this.form[key] = ''
       })
      this.dialogVisible = false
    },
    submitData() {
      if (!this.form.title || !this.form.projectId) {
        this.$message({type: 'info', message: '请选择项目并填写标题!'})
        return;
      }
      //type=3表示是思维导图数据
      let formData = {
        ...this.form,
        type: 3
      }
      postJsonRequest('/article/add', formData).then(res => {
        if (res.data.code === 200) {
          this.$message({type: 'success', message: '添加成功!'});
        }
        this.dialogVisible = false
        this.loadArticles()
      })
    }
  }
}
</script>

<style scoped>
.container {
  height: 90%;
  width: 90%;
  margin: 10px;
}

.container-body {
  width: 100%;
  margin-top: 15px;
}

.article-info {
  background-color: white;
  padding: 5px;
  margin-bottom: 5px;
  border-radius: 3px;
}

.article-title {
  font-size: 16px;
  font-weight: bold;
}

.article-desc {
  opacity: 0.7;
  margin-top: 5px;
}

.article-opr {
  margin-top: 15px;
  text-align: center;
}

</style>