
Pod::Spec.new do |s|
  s.name         = "RNBrainblocks"
  s.version      = "1.0.0"
  s.summary      = "RNBrainblocks"
  s.description  = <<-DESC
                  RNBrainblocks
                   DESC
  s.homepage     = ""
  s.license      = "MIT"
  # s.license      = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author             = { "author" => "author@domain.cn" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/author/RNBrainblocks.git", :tag => "master" }
  s.source_files  = "RNBrainblocks/**/*.{h,m}"
  s.requires_arc = true


  s.dependency "React"
  #s.dependency "others"

end

  