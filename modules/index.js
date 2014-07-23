/*jshint latedef:false */
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var meanpGen = require('../app/index');

var ModuleGenerator = meanpGen.extend({
  constructor: function () {
    meanpGen.apply(this, arguments);
    this.attrs = this.arguments.map(function (attr) {
      var parts = attr.split();
      return {
        name: parts[0],
        action: parts[1]
      };
    })[0];
    var dirPath = '/templates';
    this.sourceRoot(path.join(__dirname, dirPath));
  },

  createModuleFiles: function () {
    var done = this.async();
    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the meanp module generator!'));
    var prompts = [{
      name: 'moduleName',
      message: 'How would you like to name your new module?',
      default: this.attrs ? this.attrs.name : 'example'
    }];
    this.prompt(prompts, function (props) {
      this.moduleName = props.moduleName;
      done();
    }.bind(this));
  },
  afterConfirm: function(){
    var base = this.dest._base;
    var src = this.src._base;
    console.log(src)
    var path = base + '/public/modules/' + this.moduleName;
    //Directory of the destination
    var directory = [ base + '/api', base + '/api/controllers', base + '/api/models', base + '/public', base + '/public/modules', path, path + '/controllers', path + '/services', path + '/assets', path + '/assets/css', path + '/views']
    //Files of the template
    var files = [{
      origin: src + '/api/controller.js',
      dest: base + '/api/controllers/' + this.moduleName + '.js'
    },{
      origin: src + '/controllers/main.js',
      dest: path + '/controllers/' + this.moduleName + '.js'
    }, {
      origin: src + '/services/factory.js',
      dest: path + '/services/' + this.moduleName + '.js'
    },{
      origin: src + '/views/main.html',
      dest: path + '/views/index.html'
    },{
      origin: src + '/assets/css/main.css',
      dest: path + '/assets/css/' + this.moduleName + '.css'
    },{
      origin: src + '/package.json',
      dest: path + '/package.json'
    },{
      origin: src + '/app.js',
      dest: path + '/module.js'
    }];
    var baseArray = base.split('/');
    var counter = 0;
    for (counter in directory){
      this.mkdir(directory[counter]);
      var indexOfFolder = directory[counter].indexOf(baseArray[baseArray.length - 1]);
      console.log(chalk.green(directory[counter].substr(indexOfFolder) + ' directory was created'));
    };
    counter = 0;
    for(counter in files){
      var fileContent = this.readFileAsString(files[counter].origin);
      if(fileContent){
        console.log(chalk.cyan('Changed moduleName variables...'));
        fileContent = fileContent.replace(/__moduleName__/g, this.moduleName);
      }
      var indexOfFolder = files[counter].dest.indexOf(baseArray[baseArray.length - 1]);
      this.write(files[counter].dest, fileContent);
      console.log(chalk.green(files[counter].dest.substr(indexOfFolder) + ' file was successfully created'));
    };
    //Back-End SetUp
    var hook   = '//===== meanp-cli hook =====//';
    var routesFile   = this.readFileAsString(base + '/api/config/routes.js');
    var insert = "app.get('/" + this.moduleName + "', auth.ensureAuthenticated, " + this.moduleName + ".get);";
    if (routesFile.indexOf(insert) === -1) {
      this.write(base + '/api/config/routes.js', routesFile.replace(hook, insert+'\n'+hook));
    }
    var modulesApp   = this.readFileAsString(base + '/public/modules/app.js');
    var insert = ".when('/" + this.moduleName + "', {templateUrl: 'modules/" + this.moduleName + "/views/index.html', controller: '" + this.moduleName + "Ctrl' })";
    if (modulesApp.indexOf(insert) === -1) {
      this.write(base + '/public/modules/app.js', modulesApp.replace(hook, insert+'\n'+hook));
    }
  }
});

module.exports = ModuleGenerator;