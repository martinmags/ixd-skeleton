
/*
 * GET home page.
 */

// exports.view = function(req, res){
//   res.render('index', 
//   {
//     'image': 'profileIcon.png',
//     'id': 'profileicon'
//   },{},
//   {
//     'image': 'downarrow.jpeg',
//     'id': 'downarrow'
//   });
// };

exports.view = function(req,res){
  res.render('index');
};