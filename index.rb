%w(base64 twitter omniauth omniauth-twitter dm-core dm-migrations dm-postgres-adapter sinatra).each { |dependency| require dependency }

DataMapper.setup(:default, ENV['HEROKU_POSTGRESQL_PURPLE_URL'] || 'postgres://twelex:twelex@localhost/twelex')
@@layout ="<!DOCTYPE html>
<html>
<head>
  <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
  <title>TWELEX - HAPPY NEW YEAR FROM Ori Pekelman</title>
  <meta name='author' content='Ori Pekelman'>
  <!-- Date: 2013-01-01 -->
  <link href='http://fonts.googleapis.com/css?family=Special+Elite' rel='stylesheet' type='text/css'>
  <link rel='stylesheet' href='/css/bootstrap.min.css'>
  <link rel='stylesheet' href='/css/styles.css'>
  <script src='/js/jquery-1.9.0.min.js'></script>  
  <script src='/js/bootstrap.min.js'></script>
  <script src='/js/fixedQueue.js'></script>
  <script src='/js/twelex.lib.js'></script>
  <script src='/js/twelex.js'></script>
  <script><%= @script %></script>
</head>
<body>
<img src ='http://www.constellationmatrix.com/images/telex_big.png' style='position:fixed; z-index:1'>
<img src ='/images/sortie154371.png' style='position:fixed;left:154px;top:373px; z-index:1000'>
<div id='typewriter_container'>
  <div id='typewriter'></div>
</div>
<canvas id='twitter' width='37px' height='800px'></canvas>
<section>
<header><img src ='/images/twelex.png' alt='TWELEX' title= 'TWELEX LOGO'/></header>
  <h1><tt>Happy new year from <a href='http://constellationmatrix.com' target='_blank'>Ori Pekelman</a></tt></h1>
  <h2><tt>Celebrating 80 years of <strong>Telex</strong></tt></h2>
  <% if  !@user.nil? then %>
    You are connected as <strong>@<%= @user.nickname%></strong> <a href='/logout'>logout</a>
    <h4>Send a twelex:</h4>
  <% end %>
<form id='image_form' action='/image' method='post'>
 <%= @message %>
  <textarea placeholder='Type your message here' id='twelextext' name='twelextext'><%= @text %></textarea>
  <textarea id='save_image' name='save_image'></textarea>
</form>
<% if  !@user.nil? then %>
<form id='twelex'>
  <input type='submit' value='Twelex!' class='btn'>
  <legend id='instructions'>Please note.. when you press submit it will Tweet the message you have just written</legend>
</form>
<% else %>
  <h3><tt><a href ='/signin'><img src='/images/twitter-bird-light-bgs.png' id = 'twitter_logo' title='twitter logo' height='25px'>Connect with Twitter to send a Twelex!</a></tt></h3>
<% end %>
<div>
</div>
<cite class='bigger'><strong>Twelex</strong> uses the ITA2 or Baudot-Murray encoding (if you could feed it to a real 1933 Telex machine it would work!)</cite>
<cite>From <a href='http://en.wikipedia.org/wiki/Telex' target='_blank'>wikipedia</a> : The telex network is a switched network of teleprinters similar to a telephone network, for the purposes of sending text-based messages [...] Telex [...] became an operational teleprinter service in 1933. The service [...] had a speed of 50 baud - approximately 66 words-per-minute.</cite>
<cite>Telex is still in operation, but has been mostly superseded by fax, email, and SWIFT, although radiotelex, telex via HF radio, is still used in the maritime industry [...] See Telegraphy#Worldwide status of telegram services for current information in different countries. Many major airlines still use telex [...]</cite>
<footer>
  <a href='http://www.constellationmatrix.com' title='constellation matrix'>
    <img src='/images/constellationmatrix.png' alt='Constellationmatrix'>
    <h4>Constellation Matrix<h4>
  </a>
</footer>
</section>
<script type='text/javascript'>

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-513879-7']);
  _gaq.push(['_setDomainName', 'twelex.com']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>
</body>
</html>"

class User
  include DataMapper::Resource
  property :id,         Serial
  property :uid,        String
  property :name,       String
  property :nickname,   String
  property :oauth_token, String
  property :oauth_token_secret, String
  property :created_at, DateTime
end

class Tweet
  include DataMapper::Resource
  property :id,         Serial
  property :uid,        String
  property :nickname,   String
  property :text,       Text
  property :created_at, DateTime
end

DataMapper.finalize
DataMapper.auto_upgrade!

use OmniAuth::Strategies::Twitter, '5t57IlUGqqzj263UCHNVMA', 'jpUoneP1BHy4NdAWFhCWzgK0WsKyiYIzUaDBDCzwbt8'


configure do
  set :protection, except: :session_hijacking
  set :sessions, true
  set :inline_templates, true
end

helpers do
  def current_user
    @current_user ||= User.get(session[:user_id]) if session[:user_id]
  end
end

get '/' do
    @message = ""
    @user = current_user
    erb @@layout
end


get '/auth/:provider/callback' do
  auth = request.env["omniauth.auth"]
  user = User.first_or_create({ :uid => auth["uid"]}, {
    :uid => auth["uid"],
    :nickname => auth["info"]["nickname"], 
    :name => auth["info"]["name"],
    :oauth_token => auth["credentials"].token,
    :oauth_token_secret => auth["credentials"].secret,
    :created_at => Time.now ,
    })
  session[:user_id] = user.id
  redirect "/"
end
  
get '/auth/failure' do
  erb "<h1>Authentication Failed:</h1><h3>message:<h3> <pre>#{params}</pre>"
end
  
get '/auth/:provider/deauthorized' do
  erb "#{params[:provider]} has deauthorized this app."
end
  
# any of the following routes should work to sign the user in: 
#   /sign_up, /signup, /sign_in, /signin, /log_in, /login
["/sign_in/?", "/signin/?", "/log_in/?", "/login/?", "/sign_up/?", "/signup/?"].each do |path|
  get path do
    redirect '/auth/twitter'
  end
end

# either /log_out, /logout, /sign_out, or /signout will end the session and log the user out
["/sign_out/?", "/signout/?", "/log_out/?", "/logout/?"].each do |path|
  get path do
    session[:user_id] = nil
    redirect '/'
  end
end


get '/:hash/?' do
  @connected = current_user.nil?
  t  = Tweet.get( params[:hash].to_i(36))    
  if t.nil?
    @message = erb "<h1>Oops could'nt find the twelex</h1>"  
    @text =  "Happy New Year From Constellation Matrix"  
  else
    @script = "$(function() {bzzz = true; p.ADD_TEXT($(\"#twelextext\").val());READQUEUE()});"
    @message = erb "<h3>this Twelex was sent by <a href=\"http://www.twitter.com/#{t.nickname}\">@#{t.nickname}</a></h3>"  
    @text =  t.text
  end
  erb @@layout
end

def photo_tweet(file, hash, text )
  msg_suffix = " [...] Read the full Twelex at http://twelex.com/#{hash}"
  msg = text[0..(100 - msg_suffix.length)] + msg_suffix
    
  if current_user
    @client = Twitter::Client.new(
      :consumer_key => "5t57IlUGqqzj263UCHNVMA",
      :consumer_secret => "jpUoneP1BHy4NdAWFhCWzgK0WsKyiYIzUaDBDCzwbt8",
      :oauth_token => current_user.oauth_token,
      :oauth_token_secret => current_user.oauth_token_secret
    )
   @client.update_with_media(msg, file)
  end 
end  

set :public_folder, File.dirname(__FILE__) + "/static/"
@data = ""

post '/image' do
  throw(:halt, [401, "Not authorized\n"]) unless current_user
    
  tweet = Tweet.create({
    :uid => current_user.uid,
    :nickname => current_user.nickname, 
    :text => params[:twelextext],
    :created_at => Time.now
    })
    
  puts tweet
     
  hash = tweet.id.to_s(36)
    
  img_name = "./tmp/twelex_#{hash}.png"
    @data = Base64.decode64(params[:save_image])
  #File.open(img_name, 'wb') do|f|
  #  f.write(@data)
  #end    
  photo_tweet(@data, hash, params[:twelextext])
end