
//存储数据在本地

module.exports = {
  getLinks() {
    let links = localStorage.getItem('links');
    links = links? JSON.parse(links) : [];
    return links
  },
  setLinks(links) {
    links = JSON.stringify(links); //将json数据转换为字符串存储
    return localStorage.setItem('links', links);
  },
  deleteALink(key) {
    let links = this.getLinks()
    links.splice(key,1)
    return this.setLinks(links)
  },
  addLink(link) {
    //添加一个连接，如果本地就存了，更新，没存新增
    let links = this.getLinks()
    for (let i = 0; i < links.length; i++) {
      if (link.host == links[i].host && link.port == links[i].port){
        //更新
        links[i] = link
        return this.setLinks(links)
      }
    }
    //新增
    links.push(link)     
    return this.setLinks(links)
  },
  // ---------------------------------------------------------------------
  getSQLSuggestions() {
    let suggestions = localStorage.getItem('sql-suggestions');
    suggestions = suggestions? JSON.parse(suggestions) : [];
    return suggestions
  },
  setSQLSuggestions(suggestions) {
    suggestions = JSON.stringify(suggestions); //将json数据转换为字符串存储
    localStorage.setItem('sql-suggestions', suggestions);
  },
  addSQLSuggestion(suggestion) {
    //添加一个连接，如果本地就存了，更新，没存新增
    let suggestions = this.getSQLSuggestions()
    for (let i = 0; i < suggestions.length; i++) {
      if (suggestion == suggestions[i].value) {
        return suggestions
      }
    }
    //新增
    suggestions.push({"value": suggestion})     
    this.setSQLSuggestions(suggestions)
    return suggestions
  },
  // ---------------------------------------------------------------------
  getDroppedSQLs() {
    let sqls = localStorage.getItem('sql-dropped');
    sqls = sqls? JSON.parse(sqls) : [];
    return sqls
  },
  setDroppedSQLs(sqls) {
    sqls = JSON.stringify(sqls); //将json数据转换为字符串存储
    localStorage.setItem('sql-dropped', sqls);
  },
  addDroppedSQL(sql, table_name) {
    //添加一个连接，如果本地就存了，更新，没存新增
    let sqls = this.getDroppedSQLs()
    for (let i = 0; i < sqls.length; i++) {
      if (table_name == sqls[i].name) {
        return sqls
      }
    }
    //新增
    sqls.push({"sql": sql, "name": table_name})     
    this.setDroppedSQLs(sqls)
    return sqls
  },
}